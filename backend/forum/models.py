from django.db import models
from django.contrib.auth.models import User
from textblob import TextBlob
from .models import Course

class Forum(models.Model):
    title = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='forums')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True) 

    def __str__(self):
        return self.title

class Thread(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='threads')
    title = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='threads_created')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Post(models.Model):
    id = models.AutoField(primary_key=True)
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    sentiment = models.CharField(max_length=10, choices=(('positive', 'Positive'), ('negative', 'Negative'), ('neutral', 'Neutral')), blank=True)
    language = models.CharField(max_length=10, blank=True)
    is_moderated = models.BooleanField(default=False) 

    def __str__(self):
        return f"{self.author.username} - {self.content[:30]}..."

    def save(self, *args, **kwargs):
        if not self.pk:  # Only analyze sentiment if it's a new post 
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
        analysis = TextBlob(self.instance.content)
        language = analysis.detect_language()
        if language != 'en':
            translated_content = analysis.translate(to='en')
            return translated_content.string
        return self.instance.content
    
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author.username} - {self.content[:30]}..."
        
class Moderation(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    reason = models.CharField(max_length=255, choices=(
        ('spam', 'Spam'),
        ('offensive', 'Offensive Content'),
        ('irrelevant', 'Irrelevant'),
        ('other', 'Other'),
    ))
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    moderator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderated_posts')
    action_taken = models.CharField(max_length=20, choices=(
        ('delete', 'Delete'),
        ('warn', 'Warn User'),
        ('ban', 'Ban User'),
        ('none', 'No Action'),
    ), default='none', blank=True)
    action_description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Moderation Report: {self.reason} on post {self.post.id} by {self.reported_by.username}"