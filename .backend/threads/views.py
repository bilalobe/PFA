
import logging
from google.cloud import firestore
from google.cloud.firestore import ArrayUnion, ArrayRemove
from google.cloud.exceptions import NotFound, GoogleCloudError, Conflict
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import viewsets, permissions, status
from common.firebase_admin_init import db
from backend.forums.models import Thread
from backend.forums.permissions import IsInstructorOrReadOnly
from backend.game.utils import award_points
from backend.notifications.tasks import send_notification
from .serializers import ThreadSerializer, ThreadCreateSerializer
from ratelimit.decorators import ratelimit # type: ignore

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ThreadViewSet(viewsets.ModelViewSet):
    """
    A viewset for handling CRUD operations related to threads.

    This viewset provides the following actions:
    - list: Retrieve a list of threads.
    - create: Create a new thread.
    - retrieve: Retrieve a specific thread.
    - update: Update a specific thread.
    - partial_update: Partially update a specific thread.
    - destroy: Delete a specific thread.
    - close_thread: Close a specific thread.
    - reopen_thread: Reopen a specific thread.
    - mark_as_solved: Mark a specific thread as solved.
    - unmark_as_solved: Unmark a specific thread as solved.
    - pin_thread: Pin a specific thread.
    - unpin_thread: Unpin a specific thread.
    - subscribe: Subscribe to a specific thread.
    - unsubscribe: Unsubscribe from a specific thread.
    - notifications: Retrieve notifications for a specific thread.
    - add_tag: Add a tag to a specific thread.

    This viewset uses the following filters:
    - forum: Filter threads by forum.
    - created_by: Filter threads by creator.
    - is_closed: Filter closed threads.
    - is_solved: Filter solved threads.

    This viewset supports searching threads by title, content, and tags.

    This viewset supports ordering threads by created_at, updated_at, and title.

    This viewset requires authentication for most actions, except for listing and retrieving threads.
    """
    queryset = Thread.objects.select_related('forum', 'created_by').all()  # Using select_related for performance optimization
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['forum', 'created_by', 'is_closed', 'is_solved']
    search_fields = ['title', 'content', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'title']

    def get_serializer_class(self):
        if self.action == "create":
            return ThreadCreateSerializer
        return ThreadSerializer

    def perform_create(self, serializer):
        try:
            forum = serializer.validated_data.get("forum")
            thread_data = serializer.validated_data
            thread_data.update({
                "created_by": self.request.user.get_username(),
                "created_at": firestore.SERVER_TIMESTAMP
            })
            thread_ref = db.collection("threads").document()
            thread_ref.set(thread_data)
            award_points(self.request.user, 10)
            send_notification(thread_ref.id, self.request, message="Notification message")
            return Response({"status": "Thread created", "id": thread_ref.id}, status=status.HTTP_201_CREATED)
        except (NotFound, GoogleCloudError, Conflict) as e:
            logger.error(f"Error creating thread: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(cache_page(60*2))  # Caching this view for 2 minutes
    @action(detail=True, methods=["post"], permission_classes=[IsInstructorOrReadOnly])
    def close_thread(self, request, pk=None):
        try:
            thread_ref = db.collection("threads").document(pk)
            thread_ref.update({
                "is_closed": True,
                "closed_by": request.user.username,
                "closed_at": firestore.SERVER_TIMESTAMP
            })
            return Response({"status": "Thread closed"})
        except (NotFound, GoogleCloudError, Conflict) as e:
            logger.error(f"Error closing thread: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(cache_page(60*2))  # Caching this view for 2 minutes
    @action(detail=True, methods=["post"], permission_classes=[IsInstructorOrReadOnly])
    def reopen_thread(self, request, pk=None):
        try:
            thread_ref = db.collection("threads").document(pk)
            thread_ref.update({
                "is_closed": False,
                "closed_by": None,
                "closed_at": None
            })
            return Response({"status": "Thread reopened"})
        except (NotFound, GoogleCloudError, Conflict) as e:
            logger.error(f"Error reopening thread: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True))
    def mark_as_solved(self, request, **kwargs):
        try:
            def transaction_update(transaction, thread_ref):
                thread = thread_ref.get(transaction=transaction).to_dict()
                if thread is None or thread.get("is_solved"):
                    raise PermissionDenied("Thread is already marked as solved or does not exist")
                transaction.update(thread_ref, {
                    "is_solved": True,
                    "solved_by": request.user.email,
                    "solved_at": firestore.SERVER_TIMESTAMP
                })

            thread_id = kwargs.get('pk')  # Use the 'pk' from the URL
            thread_ref = db.collection('threads').document(thread_id)

            transaction = db.transaction()
            with db.transaction() as transaction:
                try:
                    transaction_update(transaction, thread_ref)
                except Exception as e:
                    # Rollback is handled automatically by the context manager upon exception
                    raise e

            return Response({"status": "Thread marked as solved"})
        except (NotFound, GoogleCloudError, Conflict) as e:
            logger.error(f"Error marking thread as solved: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True))
    @action(detail=True, methods=["post"], permission_classes=[IsInstructorOrReadOnly])
    def unmark_as_solved(self, request, pk=None):
        try:
            thread_ref = db.collection("threads").document(pk)
            thread_ref.update({
                "is_solved": False,
                "solved_by": None,
                "solved_at": None
            })
            return Response({"status": "Thread unmarked as solved"})
        except (NotFound, GoogleCloudError, Conflict) as e:
            logger.error(f"Error unmarking thread as solved: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True))
    @action(detail=True, methods=["post"], permission_classes=[IsInstructorOrReadOnly])
    def pin_thread(self, request, pk=None):
        try:
            thread_ref = db.collection("threads").document(pk)
            thread_ref.update({
                "is_pinned": True,
                "pinned_by": request.user.username,
                "pinned_at": firestore.SERVER_TIMESTAMP
            })
            return Response({"status": "Thread pinned"})
        except (NotFound, GoogleCloudError, Conflict) as e:
            logger.error(f"Error pinning thread: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True))
    @action(detail=True, methods=["post"], permission_classes=[IsInstructorOrReadOnly])
    def unpin_thread(self, request, pk=None):
        try:
            thread_ref = db.collection("threads").document(pk)
            thread_ref.update({
                "is_pinned": False,
                "pinned_by": None,
                "pinned_at": None
            })
            return Response({"status": "Thread unpinned"})
        except (NotFound, GoogleCloudError, Conflict) as e:
            logger.error(f"Error unpinning thread: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True))
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def subscribe(self, request, pk=None):
        try:
            thread_ref = db.collection("threads").document(pk)
            subscriptions_ref = thread_ref.collection("subscriptions").document(request.user.email)
            subscriptions_ref.set({"subscribed_at": firestore.SERVER_TIMESTAMP})
            return Response({"status": "Subscribed to thread"})
        except (NotFound, GoogleCloudError, Conflict) as e:
            logger.error(f"Error subscribing to thread: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True))
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def unsubscribe(self, request, pk=None):
        try:
            thread_ref = db.collection("threads").document(pk)
            subscriptions_ref = thread_ref.collection("subscriptions").document(request.user.email)
            subscriptions_ref.delete()
            return Response({"status": "Unsubscribed from thread"})
        except (NotFound, GoogleCloudError, Conflict) as e:
            logger.error(f"Error unsubscribing from thread: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(cache_page(60*2))  # Caching this view for 2 minutes
    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def notifications(self, request, pk=None):
        try:
            thread_ref = db.collection("threads").document(pk)
            notifications_ref = thread_ref.collection("notifications").stream()
            notifications = [notif.to_dict() for notif in notifications_ref]
            return Response(notifications)
        except (NotFound, GoogleCloudError, Conflict) as e:
            logger.error(f"Error fetching notifications: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=["post"], permission_classes=[IsInstructorOrReadOnly])
    def add_tag(self, request, pk=None):
        try:
            tag = request.data.get("tag")
            if not tag:
                return Response({"error": "Tag is required"}, status=status.HTTP_400_BAD_REQUEST)
            thread_ref = db.collection("threads").document(pk)
            thread_ref.update({
                "tags": ArrayUnion([tag])
            })
            return Response({"status": "Tag added"})
        except (NotFound, GoogleCloudError, Conflict) as e:
            logger.error(f"Error adding tag: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=["post"], permission_classes=[IsInstructorOrReadOnly])
    def remove_tag(self, request, pk=None):
        try:
            tag = request.data.get("tag")
            if not tag:
                return Response({"error": "Tag is required"}, status=status.HTTP_400_BAD_REQUEST)
            thread_ref = db.collection("threads").document(pk)
            thread_ref.update({
                "tags": ArrayRemove([tag])
            })
            return Response({"status": "Tag removed"})
        except (NotFound, GoogleCloudError, Conflict) as e:
            logger.error(f"Error removing tag: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
