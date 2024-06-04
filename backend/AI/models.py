from django.db import models

class SentimentAnalysisResult(models.Model):
    text = models.TextField()
    sentiment = models.CharField(max_length=10)  # e.g., 'positive', 'negative', 'neutral'
    polarity = models.FloatField()
    subjectivity = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sentiment for '{self.text[:20]}...': {self.sentiment}"