from django.db import models
from backend.user.models import User
from threads.models import Thread
from textblob import TextBlob, Word

class Post(models.Model):
    """
    Represents a post in a thread.

    Attributes:
        thread (Thread): The thread to which the post belongs.
        author (User): The author of the post.
        content (str): The content of the post.
        created_at (datetime): The timestamp when the post was created.
        sentiment (str): The sentiment of the post (positive, negative, or neutral).
        polarity (float): The polarity score of the post.
        language (str): The language of the post.
        is_moderated (bool): Indicates if the post has been moderated.

    Methods:
        __str__(): Returns a string representation of the post.
        save(): Saves the post to the database.
        analyze_sentiment(): Analyzes the sentiment of the post.
        detect_language(): Detects the language of the post.
        correct_spelling(): Corrects the spelling in the post content.
    """
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name="posts")
    author = models.ForeignKey(User, on_delete=models.CASCADE)
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
    )
    polarity = models.FloatField(default=0)
    language = models.CharField(max_length=10, blank=True)
    is_moderated = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.author.username} - {self.content[:30]}..."

    def save(self, *args, **kwargs):
        if not self.pk:
            self.sentiment = self.analyze_sentiment()
            self.language = self.detect_language()
        super().save(*args, **kwargs)

    def analyze_sentiment(self):
        analysis = TextBlob(self.content)
        polarity = analysis.sentiment.polarity
        if polarity > 0:
            return "positive"
        elif polarity < 0:
            return "negative"
        else:
            return "neutral"

    def detect_language(self):
        analysis = TextBlob(self.content)
        return analysis.detect_language()

    def correct_spelling(self):
        """
        Corrects spelling in the post content.
        """
        corrected_text = ""
        words = self.content.split(" ")
        for word in words:
            corrected_word = Word(word).spellcheck()[0][0]
            corrected_text += " " + corrected_word
        return corrected_text.strip()