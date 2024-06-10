from django.db import models
from django.contrib.auth.models import User
from courses.models import Course

class ChatRoom(models.Model):
    """
    Represents a chat room.
    """
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=(
        ('private', 'Private'),
        ('course', 'Course')
    ), default='private')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='chat_rooms')  # For course-based chats

    def __str__(self):
        return self.name

class ChatMessage(models.Model):
    """
    Represents a single message in a chat room.
    """
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.message}"

# ... (You might want to add additional fields, like a "read" flag) ...