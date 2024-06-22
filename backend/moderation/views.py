from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Moderation
from .serializers import ModerationSerializer
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django.core.mail import send_mail
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model

User = get_user_model()

class ModerationViewSet(viewsets.ModelViewSet):
    queryset = Moderation.objects.all()
    serializer_class = ModerationSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            user_profile = getattr(user, 'userprofile', None)
            if user_profile and user_profile.user_type == "teacher":  
                return Moderation.objects.filter(
                    content_object__course__instructor=user
                )
            return Moderation.objects.filter(reported_by=user)
        return Moderation.objects.none()

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)


@login_required
@permission_required("moderation.view_moderation", raise_exception=True)
def moderation_dashboard(request):
    pending_moderations = Moderation.objects.filter(action_taken="none").order_by("-created_at")
    context = {"pending_moderations": pending_moderations}
    return render(request, "moderation/moderation_dashboard.html", context)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def take_action(request, moderation_id):
    """
    Take action on a moderation report.
    """
    try:
        moderation = Moderation.objects.get(pk=moderation_id)
    except Moderation.DoesNotExist:
        return Response({"detail": "Moderation report not found."}, status=status.HTTP_404_NOT_FOUND)

    if not request.user.has_perm("moderation.change_moderation"):
        return Response({"detail": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

    serializer = ModerationSerializer(moderation, data=request.data, partial=True)
    if serializer.is_valid():
        action_taken = serializer.validated_data.get("action_taken") if serializer.validated_data else None
        if action_taken:
            serializer.save(moderator=request.user, action_taken_at=timezone.now())

            if action_taken == "delete" and moderation.content_object and hasattr(moderation.content_object, "delete"):
                moderation.content_object.delete()
            elif action_taken == "warn" and moderation.content_object and hasattr(moderation.content_object, "creator"):
                content_creator_email = moderation.content_object.creator.email
                send_mail(
                    'Content Moderation Warning',
                    'Your content has been flagged and warned for violating our policies.',
                    'from@example.com',
                    [content_creator_email],
                    fail_silently=False,
                )
            elif action_taken == "ban" and moderation.content_object and hasattr(moderation.content_object, "creator"):
                user_to_ban = moderation.content_object.creator
                user_to_ban.is_banned = True
                user_to_ban.save()

            return Response({"message": "Moderation action taken."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Action taken must be specified."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def report_content(request):
    content_type_id = request.data.get("content_type")
    object_id = request.data.get("object_id")
    reason = request.data.get("reason")

    if not all([content_type_id, object_id, reason]):
        return Response({"error": "content_type, object_id, and reason are required fields."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        content_type = ContentType.objects.get_for_id(content_type_id)
        content_object = content_type.get_object_for_this_type(pk=object_id)
    except (ContentType.DoesNotExist, ObjectDoesNotExist):
        return Response({"error": "Invalid content type or object ID."}, status=status.HTTP_400_BAD_REQUEST)

    if Moderation.objects.filter(content_type=content_type, object_id=object_id, reason=reason, reported_by=request.user, action_taken="none").exists():
        return Response({"detail": "You have already reported this content for this reason."}, status=status.HTTP_400_BAD_REQUEST)

    moderation = Moderation.objects.create(content_object=content_object, reason=reason, reported_by=request.user)
    notify_moderators(moderation)

def notify_moderators(moderation):
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)("moderators", {"type": "moderation_notification", "moderation": ModerationSerializer(moderation).data})
    return Response(ModerationSerializer(moderation).data, status=status.HTTP_201_CREATED)