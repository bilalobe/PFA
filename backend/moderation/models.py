from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from django.db import models

class Moderation(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    reason = models.CharField(max_length=255, choices=(
        ('spam', 'Spam'),
        ('offensive', 'Offensive Content'),
        ('irrelevant', 'Irrelevant'),
        ('other', 'Other'),
    ))
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_moderations') 
    created_at = models.DateTimeField(auto_now_add=True)
    moderator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderated_items') 
    action_taken = models.CharField(max_length=20, choices=(
        ('delete', 'Delete'),
        ('warn', 'Warn User'),
        ('ban', 'Ban User'),
        ('none', 'No Action'), 
    ), default='none', blank=True)
    action_taken_at = models.DateTimeField(null=True, blank=True) 
    action_description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Moderation Report: {self.reason} on {self.content_object} by {self.reported_by.username}"