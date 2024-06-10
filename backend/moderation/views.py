from django.shortcuts import get_object_or_404, render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes 
from rest_framework.response import Response
from .models import Moderation 
from .serializers import ModerationSerializer
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.contenttypes.models import ContentType
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class ModerationViewSet(viewsets.ModelViewSet):
    queryset = Moderation.objects.all()
    serializer_class = ModerationSerializer
    permission_classes = [permissions.IsAuthenticated] # At minimum, authentication is required

    def get_queryset(self):
        """
        Returns a queryset of moderation reports.
        Instructors can see reports for their courses.
        Other users can only see their own reports.
        """
        if self.request.user.user_type == 'teacher':
            return Moderation.objects.filter(content_object__course__instructor=self.request.user)
        else:
            return Moderation.objects.filter(reported_by=self.request.user) 

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

@login_required
@permission_required('moderation.view_moderation', raise_exception=True)
def moderation_dashboard(request):
    """
    Displays the moderation dashboard.
    Only accessible to users with the 'moderation.view_moderation' permission.
    """
    pending_moderations = Moderation.objects.filter(action_taken='none').order_by('-created_at')
    context = {
        'pending_moderations': pending_moderations
    }
    return render(request, 'moderation/moderation_dashboard.html', context)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated]) 
def take_action(request, moderation_id):
    """
    Allows authorized users to take action on a moderation report.
    Possible actions: delete, warn, ban, or none.
    """
    try:
        moderation = Moderation.objects.get(pk=moderation_id)
    except Moderation.DoesNotExist:
        return Response({"detail": "Moderation report not found."}, status=status.HTTP_404_NOT_FOUND)

    if not request.user.has_perm('moderation.change_moderation'): # Check permission
        return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ModerationSerializer(moderation, data=request.data, partial=True)

    if serializer.is_valid():
        action_taken = serializer.validated_data.get('action_taken')
        serializer.save(moderator=request.user, action_taken_at=timezone.now())

        if action_taken == 'delete':
            moderation.content_object.delete()
        elif action_taken == 'warn':
            # Implement warn logic, e.g., send a warning message to the user
            pass 
        elif action_taken == 'ban':
            # Implement ban logic, e.g., set a flag on the user model
            pass

        return Response({"message": "Moderation action taken."}, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def report_content(request):
    """
    Endpoint for reporting content for moderation.
    """
    content_type_id = request.data.get('content_type')
    object_id = request.data.get('object_id')
    reason = request.data.get('reason')

    if not all([content_type_id, object_id, reason]):
        return Response({'error': 'content_type, object_id, and reason are required fields.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        content_type = ContentType.objects.get_for_id(content_type_id)
        content_object = content_type.get_object_for_this_type(pk=object_id)
    except (ContentType.DoesNotExist, ObjectDoesNotExist):
        return Response({'error': 'Invalid content type or object ID.'}, status=status.HTTP_400_BAD_REQUEST)

    # Prevent duplicate reports
    if Moderation.objects.filter(
        content_type=content_type,
        object_id=object_id,
        reason=reason,
        reported_by=request.user,
        action_taken='none'
    ).exists():
        return Response({'detail': 'You have already reported this content for this reason.'}, status=status.HTTP_400_BAD_REQUEST)

    moderation = Moderation.objects.create(
        content_object=content_object,
        reason=reason,
        reported_by=request.user,
    )

    # Optionally notify moderators in real-time (e.g., using Django Channels)
    # ... 
def notify_moderators(moderation):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "moderators",
        {
            "type": "moderation_notification",
            "moderation": ModerationSerializer(moderation).data,
        },
    )

    return Response(ModerationSerializer(moderation).data, status=status.HTTP_201_CREATED)