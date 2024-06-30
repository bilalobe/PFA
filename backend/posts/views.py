from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
from posts.serializers import PostSerializer
from backend.notifications.tasks import send_notification
from backend.AI.views import sentiment_analysis, correct_text, translate_text
from backend.game.utils import award_points
from backend.common.firebase_admin_init import db
import logging

class PostViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing post instances.
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Create a new post, sending a notification and awarding points to the user.
        """
        user_ref = db.collection('users').document(self.request.user.pk)
        user_doc = user_ref.get()
        if user_doc.exists() and user_doc.to_dict().get('banned_from_forum', False): # type: ignore
            raise PermissionDenied("You are banned from posting in the forum.")

        post_data = serializer.validated_data
        post_data['author'] = user_ref
        post_ref = db.collection('posts').add(post_data)[1]
        post = post_ref.get().to_dict() if post_ref else None

        if post:
            send_notification(post, self.request, "New post created")
            self.analyze_and_flag_post(post_ref)
            award_points(str(self.request.user.pk), 5)
        else:
            logging.error("Failed to create post reference in Firestore")

    
    def analyze_and_flag_post(self, post_ref):
        """
        Analyzes the content of a post, performs sentiment analysis, and flags the post if necessary.

        Args:
            post_ref: A reference to the post document in the database.

        Returns:
            None
        """
        post = post_ref.get() if post_ref is not None else None
        if post is not None and post.exists():
            post_data = post.to_dict()
            corrected_content = correct_text(post_data['content'])
            sentiment_result = sentiment_analysis(corrected_content)
            sentiment = sentiment_result['sentiment']
            post_ref.update({'sentiment': sentiment, 'content': corrected_content})

            if sentiment == "negative":
                author_ref = post_data['author']
                author_doc = author_ref.get()
                if author_doc.exists():
                    author_data = author_doc.to_dict()
                    strikes = author_data.get('strikes', 0) + 1
                    author_ref.update({'strikes': strikes})

                    if strikes >= 3:
                        author_ref.update({'banned_from_forum': True})
                        author_email = author_data.get('email')  # Assuming email is stored in the user document
                        if author_email:
                            send_mail(
                                'Forum Posting Ban Notification',
                                'Due to repeated violations of our community guidelines, your account has been banned from posting in the forum.',
                                settings.DEFAULT_FROM_EMAIL,
                                [author_email],
                                fail_silently=False,
                            )

    @action(detail=True, methods=["get"])
    def translate(self, request, pk=None):
        """
        Translate the content of the post to the specified language.
        """
        post_ref = db.collection('posts').document(pk)
        post = post_ref.get()
        if not post.exists():
            raise NotFound("Post not found")

        post_data = post.to_dict()
        target_language = request.query_params.get("to", "en")
        cache_key = f"post_translation_{pk}_{target_language}"
        translated_content = cache.get(cache_key)

        if translated_content is None:
            post_content = post_data['content'] # type: ignore
            translated_content = translate_text(post_content, target_language)
            cache.set(cache_key, translated_content, 60 * 60)

        return Response({"translation": translated_content})