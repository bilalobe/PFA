from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.http import HttpResponse
from backend.common.firebase_admin_init import db
from firebase_admin import messaging

def get_fcm_tokens_for_room(room_name):
    """
    Retrieves the FCM tokens for all users in a chat room.
    """
    chat_room_ref = db.collection('chatRooms').where('name', '==', room_name).limit(1).get()
    if chat_room_ref:  # Corrected check for non-empty query snapshot
        chat_room = chat_room_ref[0].to_dict()
        if chat_room:
            user_ids = chat_room.get("members", [])
            user_tokens = []
            for user_id in user_ids:
                user_doc = db.collection("users").document(str(user_id)).get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    if user_data:
                        fcm_token = user_data.get("fcm_token")
                        if fcm_token:  # Ensure only non-empty tokens are added
                            user_tokens.append(fcm_token)
            return user_tokens
    return []

def send_firebase_message(token, title, body):
    """
    Sends a message to a Firebase device token.
    """
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=token,
    )
    response = messaging.send(message)
    print('Successfully sent message:', response)
    return response

def send_chat_message(room_name, message, sender):
    """
    Sends a chat message to the specified room and via Firebase messaging.
    """
    # Existing WebSocket message sending
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        async_to_sync(channel_layer.group_send)(
            f"chat_{room_name}",
            {"type": "chat_message", "message": message, "user": sender.username},
        )
    else:
        print("Channel layer not found.")

    # Send Firebase message
    tokens = get_fcm_tokens_for_room(room_name)
    for token in tokens:
        send_firebase_message(token, "New Message", f"{sender.username}: {message}")

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
        return HttpResponse("Notification sent", status=200)
    else:
        print("Channel layer not found.")
        return HttpResponse("Channel layer not found", status=500)

# Helper function to get FCM tokens for room members
def store_fcm_token(user_id, fcm_token):
    """
    Stores the FCM token for a user in Firestore.
    
    Parameters:
    - user_id: The ID of the user.
    - fcm_token: The FCM token to be stored.
    """
    # Ensure the user_id and fcm_token are not None
    if user_id is None or fcm_token is None:
        raise ValueError("user_id and fcm_token must not be None")

    # Attempt to retrieve the user document from Firestore
    user_doc_ref = db.collection('users').document(str(user_id))
    user_doc = user_doc_ref.get()

    # Check if the user document exists
    if user_doc.exists:
        # Update the fcm_token field for the user
        user_doc_ref.update({'fcm_token': fcm_token})
    else:
        # Optionally, handle the case where the user does not exist in the database
        # For example, create a new user document with the fcm_token
        user_doc_ref.set({'fcm_token': fcm_token})
        raise ValueError("User does not exist in Firestore")

def get_chat_room(room_name):
    """
    Retrieves a chat room document from Firestore by its name.
    """
    chat_room_ref = db.collection('chatRooms').document(room_name)
    chat_room_doc = chat_room_ref.get()
    if chat_room_doc.exists:
        return chat_room_doc.to_dict()
    return None