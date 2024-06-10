from django.db.models import Q
from django.core.cache import cache
from django.shortcuts import redirect, render
from pytz import timezone
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied
from textblob import TextBlob, Word
from backend.forum.tasks import flag_post_for_moderation
from .models import Forum, Thread, Post, Moderation, Comment
from .serializers import ForumSerializer, ThreadSerializer, PostSerializer, ModerationSerializer, CommentSerializer
from .permissions import IsInstructorOrReadOnly, IsEnrolledStudentOrReadOnly
from django.contrib.auth.decorators import login_required, permission_required
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.mail import send_mail


class ForumViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing forums.
    Allows searching by title and description.
    """
    queryset = Forum.objects.all()
    serializer_class = ForumSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

class ThreadViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing threads within a forum.
    Allows searching by title.
    """
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated, IsEnrolledStudentOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    def perform_create(self, serializer):
        """
        Associates the new thread with the specified forum and sets the created_by field.
        """
        forum = serializer.validated_data['forum']
        serializer.save(created_by=self.request.user, forum=forum)

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing posts within a thread.
    Allows searching by content.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['content']

    def perform_create(self, serializer):
        """
        Creates a new post, associates it with the thread and author,
        then analyzes sentiment and flags for moderation if negative.
        """
        if self.request.user.banned_from_forum:
            raise PermissionDenied("You are banned from posting in the forum.")

        thread = serializer.validated_data['thread']
        post = serializer.save(author=self.request.user, thread=thread)

        # Sentiment Analysis and Automated Flagging
        if post.sentiment == 'negative':
            flag_post_for_moderation.delay(post.id) 

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            self.thread_group_name,
            {
                'type': 'send_new_post',
                'post_data': serializer.data
            }
        )

    @action(detail=True, methods=['get'])
    def analyze_sentiment(self, request, pk=None):
        """
        Analyzes sentiment of a post and returns it as a response.
        """
        post = self.get_object()
        corrected_content = self.correct_spelling(post.content)
        analysis = TextBlob(corrected_content)
        sentiment = self.get_sentiment_label(analysis.sentiment.polarity)
        return Response({'sentiment': sentiment})

    @action(detail=True, methods=['get'])
    def translate(self, request, pk=None):
        """
        Translates the post content using TextBlob and caches the result.
        """
        post = self.get_object()
        target_language = request.query_params.get('to', 'en')
        cache_key = f'post_{post.id}_translation_{target_language}'
        translated_content = cache.get(cache_key)

        if translated_content is None:
            try:
                analysis = TextBlob(post.content)
                translated_content = str(analysis.translate(to=target_language))
                cache.set(cache_key, translated_content, 60 * 60)
            except Exception as e:
                return Response({'error': f'Translation failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'translation': translated_content})

    def correct_spelling(self, text):
        """
        Corrects spelling in the given text.
        """
        corrected_text = ""
        words = text.split(' ')
        for word in words:
            corrected_word = Word(word).spellcheck()[0][0]
            corrected_text += " " + corrected_word
        return corrected_text.strip()

    def get_sentiment_label(self, polarity):
        """
        Returns a sentiment label based on the polarity score.
        """
        if polarity > 0:
            return 'positive'
        elif polarity < 0:
            return 'negative'
        else:
            return 'neutral'

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Searches for forums, threads, and posts based on a query parameter 'q'.
        """
        query = request.query_params.get('q', '')
        forums = Forum.objects.filter(Q(title__icontains=query) | Q(description__icontains=query))
        threads = Thread.objects.filter(title__icontains=query)
        posts = Post.objects.filter(content__icontains=query)
        forums_serializer = ForumSerializer(forums, many=True, context={'request': request})
        threads_serializer = ThreadSerializer(threads, many=True, context={'request': request})
        posts_serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response({
            'forums': forums_serializer.data,
            'threads': threads_serializer.data,
            'posts': posts_serializer.data
        })

class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing comments.
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        """
        Associates the new comment with the post and the author.
        """
        post = serializer.validated_data['post']
        serializer.save(author=self.request.user, post=post)

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

        # Send a notification to the moderation group

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'moderation',  # The moderation group name 
            {
                'type': 'send_moderation_notification',
                'moderation_data': serializer.data 
            }
        )
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
    Allows instructors to take action on a moderation report.
    Possible actions: delete, warn, ban, or no action.
    """
    try:
        moderation = Moderation.objects.get(pk=moderation_id)
    except Moderation.DoesNotExist:
        return Response({"detail": "Moderation report not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = ModerationSerializer(moderation, data=request.data, partial=True) 

    if serializer.is_valid():
        serializer.save(moderator=request.user, action_taken_at=timezone.now())

        action_taken = serializer.validated_data['action_taken']
        if action_taken == 'delete':
            moderation.post.delete()
        elif action_taken == 'warn':
            # Implement warn logic, for example, sending a warning message to the user
            pass  
        elif action_taken == 'ban':
            # Implement ban logic, for example, setting a flag on the user model
            pass

        return Response({"message": "Moderation action taken."}, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@login_required
@permission_required('forum.view_moderation', raise_exception=True)  
def moderation_dashboard(request):
    """
    View for the moderation dashboard.
    Only users with 'forum.view_moderation' permission can access this view.
    """
    reported_posts = Moderation.objects.filter(action_taken='none').order_by('-created_at') 
    context = {
        'reported_posts': reported_posts,
    }
    return render(request, 'forum/moderation_dashboard.html', context)