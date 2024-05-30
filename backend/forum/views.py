from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.contrib.auth.decorators import login_required, permission_required
from .models import Forum, Thread, Post, Moderation
from .serializers import ForumSerializer, ThreadSerializer, PostSerializer, ModerationSerializer
from .permissions import IsInstructorOrReadOnly, IsEnrolledStudentOrReadOnly
from .serializers import ModerationSerializer, PostSerializer
from .permissions import IsInstructorOrReadOnly

class ForumViewSet(viewsets.ModelViewSet):
    queryset = Forum.objects.all()
    serializer_class = ForumSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]

class ThreadViewSet(viewsets.ModelViewSet):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated, IsEnrolledStudentOrReadOnly]

    def perform_create(self, serializer):
        forum = serializer.validated_data['forum']
        serializer.save(created_by=self.request.user, forum=forum)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        thread = serializer.validated_data['thread']
        serializer.save(author=self.request.user, thread=thread)

class ModerationViewSet(viewsets.ModelViewSet):
    queryset = Moderation.objects.all()
    serializer_class = ModerationSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]  # Instructor or supervisor can access

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsInstructorOrReadOnly])  # Instructor or supervisor
def moderate_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        post.delete()
        return Response({"message": "Post deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

@login_required
@permission_required('forum.delete_post', raise_exception=True)
def delete_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        post.delete()
        return redirect('moderation-dashboard')  # Redirect after deleting
    except Post.DoesNotExist:
        return render(request, 'forum/post_not_found.html')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsInstructorOrReadOnly])
def report_post(request):
    """
    Endpoint for reporting a post.
    """
    serializer = ModerationSerializer(data=request.data)
    if serializer.is_valid():
        moderation_instance = serializer.save(reported_by=request.user)

        # Send email notification to the forum's instructor
        post = moderation_instance.post
        forum = post.thread.forum
        instructor = forum.course.instructor
        send_mail(
            'Post Reported',
            f'A post in your course "{forum.course.title}" has been reported.\n'
            f'Reason: {moderation_instance.reason}',
            'your_email@example.com',
            [instructor.email],
            fail_silently=False,
        )
    
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
