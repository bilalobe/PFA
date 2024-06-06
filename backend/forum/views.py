from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.contrib.auth.decorators import login_required, permission_required
from django.core.cache import cache
from textblob import TextBlob, Word
from .models import Forum, Thread, Post, Moderation
from .serializers import ForumSerializer, ThreadSerializer, PostSerializer, ModerationSerializer
from .permissions import IsInstructorOrReadOnly, IsEnrolledStudentOrReadOnly
from django.http import HttpRequest
from django.utils import timezone

class ForumViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing forums.
    """
    queryset = Forum.objects.all()
    serializer_class = ForumSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]

class ThreadViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing threads within a forum.
    """
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated, IsEnrolledStudentOrReadOnly]

    def perform_create(self, serializer):
        """
        Associates the new thread with the specified forum and sets the created_by field.
        """
        forum = serializer.validated_data['forum']
        serializer.save(created_by=self.request.user, forum=forum)

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing posts within a thread.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Associates the new post with the specified thread and sets the author field.
        """
        thread = serializer.validated_data['thread']
        serializer.save(author=self.request.user, thread=thread)

    @action(detail=True, methods=['get'])
    def analyze_sentiment(self, request, pk=None):
        """
        Analyzes the sentiment of a specific post using TextBlob.
        """
        post = self.get_object()
        corrected_content = self.correct_spelling(post.content)
        analysis = TextBlob(corrected_content)
        if analysis.sentiment.polarity > 0:
            return Response({'sentiment': 'positive'})
        elif analysis.sentiment.polarity < 0:
            return Response({'sentiment': 'negative'})
        else:
            return Response({'sentiment': 'neutral'})

    def correct_spelling(self, text):
        """
        Corrects spelling in the provided text using TextBlob's Word class.
        """
        corrected_text = ""
        words = text.split(' ')
        for word in words:
            corrected_word = Word(word).spellcheck()[0][0]
            corrected_text += " " + corrected_word
        return corrected_text.strip()

    @property
    def sentiment(self):
        """
        Caches the sentiment analysis result for improved performance.
        """
        cache_key = f'post_{self.instance.id}_sentiment'
        sentiment = cache.get(cache_key)
        if sentiment is None:
            sentiment = self.analyze_sentiment()
            cache.set(cache_key, sentiment, timeout=3600) # Cache for 1 hour
        return sentiment

    def detect_language(self):
        """
        Detects the language of the post content using TextBlob.
        """
        analysis = TextBlob(self.instance.content)
        language = analysis.detect_language()
        if language != 'en':
            translated_content = analysis.translate(to='en')
            return translated_content.string
        return self.instance.content


class ModerationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing moderation reports.
    """
    queryset = Moderation.objects.all()
    serializer_class = ModerationSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]

    def perform_create(self, serializer):
        """
        Saves a new moderation report and sends a notification to the instructor.
        """
        moderation_instance = serializer.save(reported_by=self.request.user)
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

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsInstructorOrReadOnly])
def take_action(request, moderation_id):
    """
    Handles actions (delete, warn, ban, none) on a reported post.
    """
    try:
        moderation = Moderation.objects.get(pk=moderation_id)
    except Moderation.DoesNotExist:
        return Response({"detail": "Moderation report not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = ModerationSerializer(moderation, data=request.data)

    if serializer.is_valid():
        serializer.save(moderator=request.user)

        if serializer.instance.action_taken == 'delete':
            post = moderation.post
            post.delete()

        if serializer.instance.action_taken in ['warn', 'ban']:
            # Implement warning or banning logic here
            pass

        return Response({"message": "Moderation action taken."}, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsInstructorOrReadOnly])
def moderate_post(request, post_id):
    """
    Handles deletion of a post.
    """
    try:
        post = Post.objects.get(id=post_id)
        post.delete()
        return Response({"message": "Post deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

@login_required
@permission_required('forum.delete_post', raise_exception=True)
def delete_post(request, post_id):
    """
    Deletes a post and redirects to the moderation dashboard.
    """
    try:
        post = Post.objects.get(id=post_id)
        post.delete()
        return redirect('moderation-dashboard')
    except Post.DoesNotExist:
        return render(request, 'forum/post_not_found.html')

def report_post(request, post_id):
    """
    Reports a post and redirects to the forum page.
    """
    try:
        post = Post.objects.get(id=post_id)
        Moderation.objects.create(post=post, reported_by=request.user)
        return redirect('forum', post.thread.forum.id)
    except Post.DoesNotExist:
        return render(request, 'forum/post_not_found.html')