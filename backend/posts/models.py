from django.db import models
from django.utils.translation import gettext_lazy as _
from backend.AI.views import sentiment_analysis, detect_language

class Post(models.Model):
    """
    Represents a post in a thread within the forum.

    Attributes:
        thread (models.ForeignKey): A reference to the thread this post belongs to.
        author (models.ForeignKey): The user who authored the post.
        content (models.TextField): The textual content of the post.
        created_at (models.DateTimeField): The timestamp when the post was created.
        sentiment (models.CharField): The sentiment of the post, determined by AI analysis.
        language (models.CharField): The language of the post, detected by AI.
        is_moderated (models.BooleanField): Indicates if the post has been moderated.

    The sentiment analysis and language detection are performed by an external AI Django app,
    which allows for more advanced and accurate processing.
    """

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
        return f"{self.author.username} - {self.content[:30]}..."

    def save(self, *args, **kwargs):
        """
        Overridden save method to perform AI-based sentiment analysis and language detection
        before saving the post. It utilizes utility functions for these operations.
        """
        if not self.pk:  # Only perform AI analysis for new posts
            self.sentiment = sentiment_analysis(self.content)
            self.language = detect_language(self.content)
        super().save(*args, **kwargs)