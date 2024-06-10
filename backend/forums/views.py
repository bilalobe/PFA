from django.db.models import Q
from django.core.cache import cache
from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required, permission_required
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from textblob import TextBlob, Word
from django.core.mail import send_mail
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from backend.moderation.models import Moderation
from backend.moderation.utils import send_moderation_notification
from .tasks import flag_post_for_moderation
from .models import Forum, Thread, Post, Comment, UserForumPoints
from .serializers import (
    ForumSerializer, 
    ThreadSerializer, 
    PostSerializer, 
    CommentSerializer, 
    UserForumPointsSerializer
)
from .utils import (
    send_forum_update, 
    send_new_post_notification, 
    send_new_comment_notification, 
    
)
from .permissions import IsInstructorOrReadOnly, IsEnrolledStudentOrReadOnly
from rest_framework.pagination import PageNumberPagination
from django_elasticsearch_dsl.search import Search  

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

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
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        """
        Retrieves a list of forums, using caching for improved performance.
        """
        cache_key = 'forum_list'
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        # Cache the data for 1 hour
        cache.set(cache_key, data, 60 * 60)
        return Response(data)

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
    pagination_class = StandardResultsSetPagination 

    def perform_create(self, serializer):
        """
        Creates a new thread, associates it with the forum and user,
        awards points to the author, and sends a notification.
        """
        forum = serializer.validated_data['forum']
        thread = serializer.save(created_by=self.request.user, forum=forum)
        self.award_points(self.request.user, 10)  
        self.notify_forum_updates(f'New thread created: {thread.title}')

    def notify_forum_updates(self, message):
        """
        Sends a notification through the forum_updates channel group.
        """
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'forum_updates',
            {
                'type': 'forum_update',
                'message': message
            }
        )

    def award_points(self, user, points):
        """
        Awards forum points to a user.
        """
        user_points, created = UserForumPoints.objects.get_or_create(user=user)
        user_points.points += points
        user_points.save()

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
    pagination_class = StandardResultsSetPagination 
    send_new_post_notification(post, self.request)

    def perform_create(self, serializer):
        """
        Creates a new post, associates it with the thread and author,
        analyzes sentiment, flags for moderation if necessary,
        awards points to the author, and sends a notification.
        Handles PermissionDenied if the user is banned.
        """
        if self.request.user.banned_from_forum:
            raise PermissionDenied("You are banned from posting in the forum.")

        thread = serializer.validated_data['thread']
        post = serializer.save(author=self.request.user, thread=thread)

        self.analyze_and_flag_post(post)
        self.award_points(self.request.user, 5)  
        self.send_new_post_notification(post)

    def send_new_post_notification(self, post):
        """
        Sends a new post notification through the thread group.
        """
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'thread_{post.thread.id}',
            {
                'type': 'send_new_post',
                'post_data': PostSerializer(post, context={'request': self.request}).data
            }
        )

    def analyze_and_flag_post(self, post):
        """
        Analyzes the sentiment of a post and flags it for moderation if negative.
        """
        corrected_content = self.correct_spelling(post.content)
        analysis = TextBlob(corrected_content)
        post.sentiment = self.get_sentiment_label(analysis.sentiment.polarity)
        post.save() 

        if post.sentiment == 'negative':
            flag_post_for_moderation.delay(post.id)

    def award_points(self, user, points):
        """
        Awards forum points to a user.
        """
        user_points, created = UserForumPoints.objects.get_or_create(user=user)
        user_points.points += points
        user_points.save()

    @action(detail=True, methods=['get'])
    def translate(self, request, pk=None):
        """
        Translates the post content to the specified target language, with caching.
        """
        post = self.get_object()
        target_language = request.query_params.get('to', 'en')
        cache_key = f'post_translation_{post.id}_{target_language}'
        translated_content = cache.get(cache_key)

        if translated_content is None:
            try:
                analysis = TextBlob(post.content)
                translated_content = str(analysis.translate(to=target_language))
                cache.set(cache_key, translated_content, 60 * 60)  # Cache for 1 hour
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
        Searches across forums, threads, and posts using Elasticsearch.
        Handles empty search queries.
        """
        query = request.GET.get('q', '')

        if query:
            s = Search(index=['forums', 'threads', 'posts']).query("multi_match", query=query, fields=['title', 'description', 'content'])
            results = s.execute()

            forums = [hit.to_dict() for hit in results.hits if hit.meta.index == 'forums']
            threads = [hit.to_dict() for hit in results.hits if hit.meta.index == 'threads']
            posts = [hit.to_dict() for hit in results.hits if hit.meta.index == 'posts']

            return Response({'forums': forums, 'threads': threads, 'posts': posts})
        else:
            return Response({'message': 'Please provide a search query.'}, status=status.HTTP_400_BAD_REQUEST)

class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing comments.
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    send_new_comment_notification(comment, self.request)

    def perform_create(self, serializer):
        """
        Associates the new comment with the post and author.
        Sends a notification about the new comment.
        Handles NotFound exception if the post doesn't exist.
        """
        post_id = self.kwargs.get('post_pk')
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            raise NotFound(detail="Post not found.")

        comment = serializer.save(author=self.request.user, post=post)
        self.notify_forum_updates(f'New comment created on post: {post.id}')

    def notify_forum_updates(self, message):
        """
        Sends a notification through the forum_updates channel group.
        """
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'forum_updates',
            {
                'type': 'forum_update',
                'message': message
            }
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def report_content(request):
    """
    Endpoint for reporting content for moderation.
    """
    content_type_id = request.data.get('content_type')
    content_id = request.data.get('content_id')
    reason = request.data.get('reason')

    if not content_type_id or not content_id or not reason:
        raise ValidationError("Content type, content ID, and reason are required.")

    content_type = content_type.objects.get_for_id(content_type_id)
    content_object = content_type.get_object_for_this_type(id=content_id)

    moderation = Moderation.objects.create(
        content_object=content_object,
        reported_by=request.user,
        reason=reason
    )

    send_moderation_notification(moderation, request)
    return Response({'message': 'Content reported for moderation.'}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def leaderboard(request):
    """
    Returns a paginated list of users with the most forum points.
    """
    top_users = UserForumPoints.objects.all().order_by('-points')
    paginator = PageNumberPagination()
    paginated_users = paginator.paginate_queryset(top_users, request)
    serializer = UserForumPointsSerializer(paginated_users, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search(request):
    """
    Searches across forums, threads, and posts using Elasticsearch.
    Handles empty search queries.
    """
    query = request.GET.get('q', '')

    if query:
        s = Search(index=['forums', 'threads', 'posts']).query("multi_match", query=query, fields=['title', 'description', 'content'])
        results = s.execute()

        forums = [hit.to_dict() for hit in results.hits if hit.meta.index == 'forums']
        threads = [hit.to_dict() for hit in results.hits if hit.meta.index == 'threads']
        posts = [hit.to_dict() for hit in results.hits if hit.meta.index == 'posts']

        return Response({'forums': forums, 'threads': threads, 'posts': posts})
    else:
        return Response({'message': 'Please provide a search query.'}, status=status.HTTP_400_BAD_REQUEST) 