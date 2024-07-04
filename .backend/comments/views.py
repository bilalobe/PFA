from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from backend.comments.utils import send_new_comment_notification
from forums.permissions import IsEnrolledStudentOrReadOnly
from backend.common.firebase_admin_init import db
from django.utils import timezone
from backend.comments.serializers import CommentSerializer
from firebase_admin import firestore
from typing import Dict, Any, cast

db = firestore.client()

class CommentViewSet(viewsets.ViewSet):
    """
    API endpoint for managing comments.
    """
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsEnrolledStudentOrReadOnly,
    ]

    def get_serializer(self, *args, **kwargs):
        """
        Mimic the get_serializer method.
        """
        return CommentSerializer(*args, **kwargs)

    def retrieve(self, request, pk=None):
        """
        Retrieve a comment from Firestore.
        """
        try:
            comment_doc = db.collection('comments').document(pk).get()
            if comment_doc.exists:
                comment_data = comment_doc.to_dict()
                if comment_data is not None:
                    comment_data['id'] = comment_doc.id
                return Response(comment_data)
            else:
                return Response({'detail': 'Comment not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def list(self, request):
        """
        List all comments for a specific post.
        """
        post_id = self.kwargs.get('post_pk')
        if not post_id:
            return Response({'error': 'post_id is required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            comments_ref = db.collection('comments').where('post_id', '==', post_id)
            comments_docs = comments_ref.get()
            comments = [
                {
                    'id': doc.id,
                    **(doc.to_dict() or {})
                } for doc in comments_docs
            ]
            return Response(comments)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request):
        """
        Create a new comment in Firestore.
        """
        post_id = self.kwargs.get('post_pk')
        if not post_id:
            return Response({'error': 'post_id is required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                # Convert serializer.validated_data to a regular dict
                
                validated_data: Dict[str, Any] = cast(Dict[str, Any], serializer.validated_data)
                comment_data = {k: v for k, v in validated_data.items()}
                comment_data['author'] = request.user.username
                comment_data['created_at'] = timezone.now().isoformat()  # Ensure datetime is in ISO format

                comment_ref = db.collection('comments').add(comment_data)
                document_reference, _ = comment_ref
                comment_data['id'] = document_reference.id
                send_new_comment_notification(comment_data, request)
                return Response(comment_data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """
        Update an existing comment in Firestore.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                comment_ref = db.collection('comments').document(pk)
                validated_data: Dict[str, Any] = cast(Dict[str, Any], serializer.validated_data)
                if validated_data is not None:
                    comment_ref.update({k: v for k, v in validated_data.items()})
                return Response(validated_data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """
        Delete a comment from Firestore.
        """
        try:
            db.collection('comments').document(pk).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
