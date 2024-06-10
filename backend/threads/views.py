from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Thread
from .serializers import ThreadSerializer, ThreadCreateSerializer
from forum.permissions import IsEnrolledStudentOrReadOnly, IsInstructorOrReadOnly
from gamification.utils import award_points
from .utils import send_new_thread_notification
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone

class ThreadViewSet(viewsets.ModelViewSet):
    queryset = Thread.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsEnrolledStudentOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return ThreadCreateSerializer
        return ThreadSerializer

    def perform_create(self, serializer):
        forum = serializer.validated_data['forum']
        thread = serializer.save(created_by=self.request.user, forum=forum)
        award_points(self.request.user, 10)
        send_new_thread_notification(thread, self.request)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsInstructorOrReadOnly])
    def close_thread(self, request, pk=None):
        thread = self.get_object()
        thread.is_closed = True
        thread.closed_by = request.user
        thread.closed_at = timezone.now()
        thread.save()
        return Response({'status': 'Thread closed'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsInstructorOrReadOnly])
    def reopen_thread(self, request, pk=None):
        thread = self.get_object()
        thread.is_closed = False
        thread.closed_by = None
        thread.closed_at = None
        thread.save()
        return Response({'status': 'Thread reopened'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsEnrolledStudentOrReadOnly])
    def mark_as_solved(self, request, pk=None):
        """
        Allows the thread creator or an instructor to mark a thread as solved.
        """
        thread = self.get_object()
        if thread.created_by != request.user and not request.user.user_type == 'teacher':
            raise PermissionDenied("You are not authorized to mark this thread as solved.")
        thread.is_solved = True
        thread.solved_by = request.user
        thread.solved_at = timezone.now()
        thread.save()
        return Response({'status': 'Thread marked as solved'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsInstructorOrReadOnly])
    def unmark_as_solved(self, request, pk=None):
        """
        Allows an instructor to unmark a thread as solved.
        """
        thread = self.get_object()
        if not request.user.user_type == 'teacher':
            raise PermissionDenied("You are not authorized to unmark this thread as solved.")
        thread.is_solved = False
        thread.solved_by = None
        thread.solved_at = None
        thread.save()
        return Response({'status': 'Thread unmarked as solved'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsInstructorOrReadOnly])
    def pin_thread(self, request, pk=None):
        """
        Allows an instructor to pin a thread.
        """
        thread = self.get_object()
        if not request.user.user_type == 'teacher':
            raise PermissionDenied("You are not authorized to pin this thread.")
        thread.is_pinned = True
        thread.pinned_by = request.user
        thread.pinned_at = timezone.now()
        thread.save()
        return Response({'status': 'Thread pinned'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsInstructorOrReadOnly])
    def unpin_thread(self, request, pk=None):
        """
        Allows an instructor to unpin a thread.
        """
        thread = self.get_object()
        if not request.user.user_type == 'teacher':
            raise PermissionDenied("You are not authorized to unpin this thread.")
        thread.is_pinned = False
        thread.pinned_by = None
        thread.pinned_at = None
        thread.save()
        return Response({'status': 'Thread unpinned'})