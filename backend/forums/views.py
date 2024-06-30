import logging
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.pagination import PageNumberPagination

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.contrib.contenttypes.models import ContentType
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from textblob import TextBlob
import nltk
nltk.download('vader_lexicon')
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from backend.comments.serializers import CommentSerializer
from backend.moderation.models import Moderation
from backend.threads.serializers import ThreadSerializer
from backend.posts.serializers import PostSerializer
from .tasks import flag_post_for_moderation
from .models import Forum, Thread, Post, Comment, UserForumPoints
from .serializers import ForumSerializer
from .permissions import IsInstructorOrReadOnly, IsEnrolledStudentOrReadOnly
from django_elasticsearch_dsl.search import Search

logger = logging.getLogger(__name__)

# Ensure User model is correctly referenced
User = get_user_model()

# Channel layer initialization
channel_layer = get_channel_layer()

# New Mixin for awarding points
class AwardPointsMixin:
    def award_points(self, user, points):
        user_points = UserForumPoints.objects.get_or_create(user=user)[0]
        user_points.points += points
        user_points.save()

class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination settings for viewsets.
    """
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

class ForumViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing forums.
    Allows searching by title and description.
    """
    queryset = Forum.objects.all().prefetch_related('threads').select_related('created_by')
    serializer_class = ForumSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description"]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """
        Customize the queryset to filter by course_id and module_id if provided.
        """
        queryset = super().get_queryset()
        course_id = self.request.GET.get('course_id')
        module_id = self.request.GET.get('module_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if module_id:
            queryset = queryset.filter(module_id=module_id)
        return queryset

    def list(self, request):
        """
        Retrieves a list of forums, using caching for improved performance.
        """
        cache_key = "forum_list"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        # Cache the data for 1 hour
        cache.set(cache_key, data, 60 * 60)
        return Response(data)

class ThreadViewSet(AwardPointsMixin, viewsets.ModelViewSet):
    """
    API endpoint for managing threads within a forum.
    Allows searching by title.
    """
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated, IsEnrolledStudentOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title"]
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        """
        Creates a new thread, associates it with the forum and user,
        awards points to the author, and sends a notification.
        """
        forum = serializer.validated_data["forum"]
        thread = serializer.save(created_by=self.request.user, forum=forum)
        self.award_points(self.request.user, 10)
        self.notify_forum_updates(f"New thread created: {thread.title}")

    def notify_forum_updates(self, message):
        """
        Sends a notification through the forum_updates channel group.
        """
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                "forum_updates", {"type": "forum_update", "message": message}
            )

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing posts within a thread.
    Allows searching by content.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsEnrolledStudentOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["content"]
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        """
        Creates a new post, associates it with the thread and author,
        analyzes sentiment, flags for moderation if necessary,
        awards points to the author, and sends a notification.
        Handles PermissionDenied if the user is banned.
        """
        # Check if the user is authenticated to avoid issues with AnonymousUser
        # and then check if the user has a profile and is banned from the forum.
        if self.request.user.is_authenticated:
            user_profile = getattr(self.request.user, 'profile', None)
            if user_profile and getattr(user_profile, 'banned_from_forum', False):
                raise PermissionDenied("You are banned from posting in the forum.")

        thread = serializer.validated_data["thread"]
        post = serializer.save(author=self.request.user, thread=thread)

        self.analyze_and_flag_post(post)
        self.send_new_post_notification(post)

    def send_new_post_notification(self, post):
        """
        Sends a new post notification through the thread group.
        """
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"thread_{post.thread.id}",
                {
                    "type": "send_new_post",
                    "post_data": PostSerializer(
                        post, context={"request": self.request}
                    ).data,
                },
            )

    def analyze_and_flag_post(self, post):
        """
        Analyzes the sentiment of a post using VADER and flags it for moderation if necessary.
        """
        corrected_content = self.correct_spelling(post.content)
        analyzer = SentimentIntensityAnalyzer()
        sentiment_score = analyzer.polarity_scores(corrected_content)['compound']
        post.sentiment = self.get_sentiment_label(sentiment_score)
        post.save()

        # Flag for moderation if the sentiment score is below -0.5 (indicative of a negative sentiment)
        if sentiment_score < -0.5:
            flag_post_for_moderation_instance = flag_post_for_moderation()
            flag_post_for_moderation_instance.delay(post.id)

    @action(detail=True, methods=["get"])
    def translate(self, request, pk=None):
        """
        Translates the post content to the specified target language, with caching.
        """
        post = self.get_object()
        target_language = request.query_params.get("to", "en")
        cache_key = f"post_translation_{post.id}_{target_language}"
        translated_content = cache.get(cache_key)

        if translated_content is None:
            try:
                analysis = TextBlob(post.content)
                translated_content = str(analysis.translate(to=target_language))
                cache.set(cache_key, translated_content, 60 * 60)  # Cache for 1 hour
            except Exception as e:
                return Response(
                    {"error": f"Translation failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response({"translation": request.body})

    def correct_spelling(self, text):
        """
        Corrects spelling in the given text using pyspellchecker.
        """
        from spellchecker import SpellChecker  # Ensure SpellChecker is imported

        spell = SpellChecker()
        words = text.split()
        corrected_words = [spell.correction(word) if word else '' for word in words if word is not None and isinstance(word, str)]
        corrected_text = " ".join(word for word in corrected_words if word is not None)
        return corrected_text

    def get_sentiment_label(self, score):
        """
        Returns a sentiment label based on the sentiment score.
        """
        if score > 0.05:
            return "positive"
        elif score < -0.05:
            return "negative"
        else:
            return "neutral"

    @action(detail=False, methods=["get"])
    def search(self, request):
        """
        Searches across forums, threads, and posts using Elasticsearch.
        Handles empty search queries.
        """
        query = request.GET.get("q", "")

        if query:
            s = Search(index=["forums", "threads", "posts"]).query(
                "multi_match", query=query, fields=["title", "description", "content"]
            )
            results = s.execute()

            forums = [
                hit.to_dict() for hit in results.hits if hit.meta.index == "forums"
            ]
            threads = [
                hit.to_dict() for hit in results.hits if hit.meta.index == "threads"
            ]
            posts = [
                hit.to_dict() for hit in results.hits if hit.meta.index == "posts"
            ]

            return Response({"forums": forums, "threads": threads, "posts": posts})
        else:
            return Response(
                {"message": "Please provide a search query."},
                status=status.HTTP_400_BAD_REQUEST,
            )

class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing comments.
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        """
        Associates the new comment with the post and author.
        Sends a notification about the new comment.
        Handles NotFound exception if the post does not exist.
        """
        post_id = self.request.POST.get("post")
        try:
            post = Post.objects.get(id=post_id)
            comment = serializer.save(author=self.request.user, post=post)
            self.send_new_comment_notification(comment)
        except Post.DoesNotExist:
            raise NotFound("Post not found.")

    def send_new_comment_notification(self, comment):
        """
        Sends a new comment notification through the post group.
        """
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"post_{comment.post.id}",
                {
                    "type": "send_new_comment",
                    "comment_data": CommentSerializer(
                        comment, context={"request": self.request}
                    ).data,
                },
            )

    def destroy(self, request, *args, **kwargs):
        """
        Deletes a comment and triggers a moderation review.
        """
        instance = self.get_object()
        content_type = ContentType.objects.get_for_model(instance)
        Moderation.objects.create(
            content_type=content_type,
            object_id=instance.id,
            user=request.user,
            action="delete",
        )
        return super().destroy(request, *args, **kwargs)
