import logging
from django.core.cache import cache
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from .serializers import ForumSerializer
from .permissions import IsInstructorOrReadOnly
from backend.common.firebase_admin_init import db


logger = logging.getLogger(__name__)

class ForumViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing forums in Firestore.
    Allows searching by title and description.
    """
    # Removed queryset = Forum.objects.none() as it's not needed for Firestore
    serializer_class = ForumSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description"]

    def list(self, request):
        """
        Retrieves a list of forums from Firestore, using caching for improved performance.
        """
        cache_key = "forum_list"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        try:
            forums_ref = db.collection('forums')
            forums_docs = forums_ref.get()
            forums = [
                {
                    'id': doc.id,
                    **doc.to_dict()
                } for doc in forums_docs
            ]
            # Cache the data for 1 hour
            cache.set(cache_key, forums, 60 * 60)
            return Response(forums)
        except Exception as e:
            logger.error(f"Error fetching forums: {e}")
            return Response({'error': 'Failed to retrieve forums.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, pk=None):
        """
        Retrieves a specific forum from Firestore.
        """
        if pk is None:
            return Response({'error': 'Forum ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            forum_doc = db.collection('forums').document(pk).get()
            if forum_doc.exists:
                forum_data = forum_doc.to_dict()
                if forum_data is None:  # Check if forum_data is None to avoid 'NoneType' not subscriptable error
                    return Response({'error': 'Failed to parse forum data.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                forum_data['id'] = forum_doc.id
                return Response(forum_data)
            else:
                return Response({'detail': 'Forum not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error fetching forum: {e}")
            return Response({'error': 'Failed to retrieve forum.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        """
        Creates a new forum in Firestore.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                forum_data = serializer.validated_data
                forum_data['created_by'] = request.user.id
                new_forum_ref = db.collection('forums').add(forum_data)
                if new_forum_ref is not None:
                    forum_data['id'] = new_forum_ref[1].id
                return Response(forum_data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Error creating forum: {e}")
                return Response({'error': 'Failed to create forum.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """
        Updates an existing forum in Firestore.
        """
        forum_id = self.kwargs.get('pk')
        if not forum_id:
            return Response({'error': 'forum_id is required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                forum_ref = db.collection('forums').document(forum_id)
                forum_ref.update(serializer.validated_data)
                return Response(serializer.validated_data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """
        Deletes a forum from Firestore.
        """
        forum_id = self.kwargs.get('pk')
        if not forum_id:
            return Response({'error': 'forum_id is required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            db.collection('forums').document(forum_id).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)