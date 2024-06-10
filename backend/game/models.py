from django.db import models
from django.contrib.auth.models import User

class UserForumPoints(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='forum_points')
    points = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.points} points"

class Badge(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255)
    image = models.ImageField(upload_to='badges/', blank=True, null=True)

    def __str__(self):
        return self.name

class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')

    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"