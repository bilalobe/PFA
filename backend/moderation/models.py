from django.db import models
from .models import Post  # Import the Post model
from user.models import User  # Import the User model

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

    def __str__(self):
        return f'{self.post} reported by {self.reported_by} for {self.reason}'
