from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.decorators import login_required, permission_required
from django.utils import timezone
from django.contrib.auth import get_user_model
from common.firebase_admin_init import db
from backend.moderation.utils import send_moderation_notification
from .serializers import ModerationReportSerializer

User = get_user_model()

def get_moderations_query(user):
    moderations_ref = db.collection('Moderations')
    if user.is_authenticated:
        if getattr(user, 'userprofile', None) and user.userprofile.user_type == "teacher":
            return moderations_ref.where('course_instructor', '==', user.id)
        else:
            return moderations_ref.where('reported_by', '==', user.id)
    return None

class ModerationViewSet(viewsets.ViewSet):
    serializer_class = ModerationReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        query = get_moderations_query(request.user)
        if query:
            moderations = query.stream()
            return Response([doc.to_dict() for doc in moderations])
        return Response([])

    def create(self, request):
        data = request.data
        data['reported_by'] = request.user.id
        moderation_ref = db.collection('Moderations').add(data)
        return Response({"success": "Moderation reported.", "id": moderation_ref[1].id})

@login_required
@permission_required("moderation.view_moderation", raise_exception=True)
def moderation_dashboard(request):
    pending_moderations = db.collection('Moderations').where('action_taken', '==', 'none').order_by('-created_at').get()
    context = {"pending_moderations": [doc.to_dict() for doc in pending_moderations]}
    return render(request, "moderation/moderation_dashboard.html", context)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def take_action(request, moderation_id):
    moderation_ref = db.collection('Moderations').document(moderation_id)
    moderation = moderation_ref.get()
    if not moderation.exists:
        return Response({"detail": "Moderation report not found."}, status=status.HTTP_404_NOT_FOUND)

    if not request.user.has_perm("moderation.change_moderation"):
        return Response({"detail": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

    action_taken = request.data.get("action_taken")
    if action_taken:
        moderation_ref.update({"moderator": request.user.id, "action_taken": action_taken, "action_taken_at": timezone.now()})
        return Response({"message": "Moderation action taken."}, status=status.HTTP_200_OK)
    return Response({"error": "Action taken must be specified."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def report_content(request):
    content_type_id, object_id, reason = request.data.get("content_type"), request.data.get("object_id"), request.data.get("reason")
    if not all([content_type_id, object_id, reason]):
        return Response({"error": "content_type, object_id, and reason are required fields."}, status=status.HTTP_400_BAD_REQUEST)

    content_ref = db.collection(content_type_id).document(object_id)
    if not content_ref.get().exists:
        return Response({"error": "Invalid content type or object ID."}, status=status.HTTP_400_BAD_REQUEST)

    existing_report = db.collection('Moderations').where('content_type', '==', content_type_id).where('object_id', '==', object_id).where('reason', '==', reason).where('reported_by', '==', request.user.id).get()
    if list(existing_report):
        return Response({"detail": "You have already reported this content for this reason."}, status=status.HTTP_400_BAD_REQUEST)

    moderation_ref = db.collection('Moderations').add({
        'content_type': content_type_id,
        'object_id': object_id,
        'reason': reason,
        'reported_by': request.user.id,
        'action_taken': 'none'
    })
    send_moderation_notification(moderation_ref[1].id, request)
    return Response({"success": "Content reported successfully."})