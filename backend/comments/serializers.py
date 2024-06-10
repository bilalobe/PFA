from rest_framework import viewsets, permissions
from .models import Comment
from .serializers import CommentSerializer
from .utils import send_new_comment_notification
from forum.permissions import IsEnrolledStudentOrReadOnly 

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsEnrolledStudentOrReadOnly]

    def perform_create(self, serializer):
        post = serializer.validated_data['post']
        comment = serializer.save(author=self.request.user, post=post)
        send_new_comment_notification(comment, self.request)