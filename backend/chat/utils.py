from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from firebase_admin import messaging

def send_chat_message(room_name, message, sender):
    """
    Sends a chat message to the specified room.
    """
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        async_to_sync(channel_layer.group_send)(
            f"chat_{room_name}",
            {"type": "chat_message", "message": message, "user": sender.username},
        )
    else:
        print("Channel layer not found.")

def send_typing_notification(room_name, user, is_typing):
    """
    Sends a typing notification to the specified room.
    """
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        async_to_sync(channel_layer.group_send)(
            f"chat_{room_name}",
            {"type": "typing_indicator", "user": user.username, "is_typing": is_typing},
        )
    else:
        print("Channel layer not found.")

def send_firebase_notification(token, title, body):
    """
    Sends a Firebase Cloud Messaging notification to the specified device.
    """
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=token,
    )

    # Send the message
    response = messaging.send(message)
    print('Successfully sent message:', response)