from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied
from textblob import TextBlob
from .models import Post
from posts.serializers import PostSerializer
from forum.permissions import IsEnrolledStudentOrReadOnly
from django.core.cache import cache
from .utils import send_new_post_notification, correct_spelling
from gamification.utils import award_points


class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing posts within a thread.
    """

    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Creates a new post, associates it with the thread and author,
        analyzes sentiment, flags for moderation if necessary,
        awards points to the author, and sends a notification.
        """
        if self.request.user.banned_from_forum:
            raise PermissionDenied("You are banned from posting in the forum.")

        thread = serializer.validated_data["thread"]
        post = serializer.save(author=self.request.user, thread=thread)

        send_new_post_notification(post, self.request)
        self.analyze_and_flag_post(post)
        award_points(self.request.user, 5)  # Award points for creating a post

    def analyze_and_flag_post(self, post):
        """
        Analyzes the sentiment of a post and flags it for moderation if negative.
        """
        corrected_content = correct_spelling(post.content)
        analysis = TextBlob(corrected_content)
        post.sentiment = self.get_sentiment_label(analysis.sentiment.polarity)
        post.save()

        if post.sentiment == "negative":
            from moderation.utils import flag_content_for_moderation

            flag_content_for_moderation(
                post,
                self.request.user,
                reason="Potentially offensive content detected.",
            )

    def get_sentiment_label(self, polarity):
        """
        Returns a sentiment label based on the polarity score.
        """
        if polarity > 0:
            return "positive"
        elif polarity < 0:
            return "negative"
        else:
            return "neutral"

    @action(detail=True, methods=["get"])
    def translate(self, request, pk=None):
        """
        Translates the post content to the specified target language, with caching.
        Handles Post.DoesNotExist and translation errors.
        """
        try:
            post = self.get_object()
        except Post.DoesNotExist:
            raise NotFound("Post not found")

        target_language = request.query_params.get("to", "en")
        cache_key = f"post_translation_{post.id}_{target_language}"
        translated_content = cache.get(cache_key)

        if translated_content is None:
            try:
                analysis = TextBlob(post.content)
                translated_content = str(analysis.translate(to=target_language))
                cache.set(cache_key, translated_content, 60 * 60)
            except Exception as e:
                return Response(
                    {"error": f"Translation failed: {e}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response({"translation": translated_content})
