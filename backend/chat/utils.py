from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import ChatMessageSerializer, ChatRoomSerializer


def send_chat_message(room_name, message, sender):
    """
    Sends a chat message to the specified room.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"chat_{room_name}",
        {"type": "chat_message", "message": message, "user": sender.username},
    )


def send_typing_notification(room_name, user, is_typing):
    """
    Sends a typing notification to the specified room.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"chat_{room_name}",
        {"type": "typing_indicator", "user": user.username, "is_typing": is_typing},
    )
