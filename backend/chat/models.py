from django.db import models
from backend.users.models import User
from courses.models import Course


class ChatRoom(models.Model):
    """
    Represents a chat room.
    """

    name = models.CharField(max_length=255)
    type = models.CharField(
        max_length=20,
        choices=(("private", "Private"), ("course", "Course")),
        default="private",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="chat_rooms",
    )  # For course-based chats

    def __str__(self):
        return self.name


class ChatMessage(models.Model):
    """
    Represents a single message in a chat room.

    Attributes:
        chat_room (ChatRoom): The chat room to which the message belongs.
        sender (User): The user who sent the message.
        receiver (User): The user who received the message.
        message (str): The content of the message.
        timestamp (datetime): The timestamp when the message was created.
    """

    chat_room = models.ForeignKey(
        ChatRoom, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_messages"
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.message}"

    class Meta:
        ordering = ["timestamp"]