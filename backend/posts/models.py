from django.db import models
from django.utils.translation import gettext_lazy as _
from backend.AI.views import sentiment_analysis, detect_language, translate_text
from google.cloud import firestore
import logging

db = firestore.Client()

class Post(models.Model):
    """
    A model representing a post in a thread.

    Attributes:
    thread (ForeignKey): The thread this post belongs to.
    author (ForeignKey): The user who created this post.
    content (TextField): The content of the post.
    created_at (DateTimeField): The date and time when the post was created.
    sentiment (CharField): The sentiment of the post, determined by AI analysis.
    language (CharField): The language of the post, detected by AI.
    is_moderated (BooleanField): Whether the post has been moderated.
    """
    id = models.AutoField(primary_key=True)
    thread = models.ForeignKey('threads.Thread', on_delete=models.CASCADE, related_name="posts")
    author = models.ForeignKey('users.User', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    sentiment = models.CharField(
        max_length=10,
        choices=(
            ("positive", "Positive"),
            ("negative", "Negative"),
            ("neutral", "Neutral"),
        ),
        blank=True,
        help_text=_("The sentiment of the post, determined by AI analysis.")
    )
    language = models.CharField(max_length=10, blank=True, help_text=_("The language of the post, detected by AI."))
    is_moderated = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.author.username} - {str(self.content)[:30]}..."
    def save(self, *args, **kwargs):
        """
        Save the post instance to the database.

        This method performs AI analysis to determine the sentiment and language
        of the post, and translates the content to English if necessary.
        """
        try:
            if not self.pk:  # Only perform AI analysis for new posts
                self.sentiment = sentiment_analysis(self.content)['sentiment']
                self.language = detect_language(self.content)
                # Translate content if not in English
                if self.language != 'en':
                    self.content = translate_text(str(self.content), 'en')
        except Exception as e:
            logging.error(f"AI analysis failed: {e}")

        super().save(*args, **kwargs)
        self.sync_to_firestore()

    def sync_to_firestore(self):
        """
        Sync the post instance to Google Firestore.
        """
        try:
            doc_ref = db.collection(u'posts').document(str(self.pk))
            doc_ref.set({
                u'thread_id': self.thread.id,
                u'author_id': self.author.id,
                u'content': self.content,
                u'created_at': self.created_at,
                u'sentiment': self.sentiment,
                u'language': self.language,
                u'is_moderated': self.is_moderated
            })
        except Exception as e:
            logging.error(f"Failed to sync post to Firestore: {e}")

    def delete(self, *args, **kwargs):
        """
        Delete the post instance from the database and Firestore.
        """
        super().delete(*args, **kwargs)
        try:
            db.collection(u'posts').document(str(self.pk)).delete()
        except Exception as e:
            logging.error(f"Failed to delete post from Firestore: {e}")
