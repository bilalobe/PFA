# backend/posts/models.py
from django.db import models
from django.contrib.auth.models import User
from threads.models import Thread
from textblob import TextBlob, Word

class Post(models.Model):
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    sentiment = models.CharField(
        max_length=10, 
        choices=(('positive', 'Positive'), ('negative', 'Negative'), ('neutral', 'Neutral')), 
        blank=True
    )
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
        if analysis.sentiment.polarity > 0:
            return 'positive'
        elif analysis.sentiment.polarity < 0:
            return 'negative'
        else:
            return 'neutral'

    def detect_language(self):
        analysis = TextBlob(self.content)
        return analysis.detect_language()

    def correct_spelling(self):
        """
        Corrects spelling in the post content.
        """
        corrected_text = ""
        words = self.content.split(' ')
        for word in words:
            corrected_word = Word(word).spellcheck()[0][0]
            corrected_text += " " + corrected_word
        return corrected_text.strip()