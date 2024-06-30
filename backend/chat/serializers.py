import logging
from rest_framework import serializers
from .models import ChatRoom, ChatMessage

logger = logging.getLogger(__name__)

class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = "__all__"

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = ChatMessage
        fields = "__all__"
