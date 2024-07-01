import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from backend.common.firebase_admin_init import db
from google.cloud.firestore import SERVER_TIMESTAMP, ArrayUnion, Query
from courses.models import Course

class ChatConsumer(AsyncWebsocketConsumer):
    """
    ChatConsumer handles the WebSocket connections for the chat feature.

    Attributes:
        room_type (str): The type of the chat room ('private' or 'course').
        room_id (str): The ID of the chat room.
        user (User): The user associated with the WebSocket connection.
        room_name (str): The name of the chat room.
        room_group_name (str): The name of the channel group for the chat room.

    Methods:
        connect(): Called when the WebSocket is handshaking as part of the connection process.
        disconnect(): Called when the WebSocket closes for any reason.
        receive(text_data): Called when the WebSocket receives a message from the client.
        chat_message(event): Sends a chat message to the WebSocket client.
        typing_indicator(event): Sends a typing indicator to the WebSocket client.
        save_message(message): Saves a chat message to the database.
        get_recent_messages(): Retrieves the most recent chat messages from the database.
        send_recent_messages(): Sends the most recent chat messages to the WebSocket client.
        get_course(course_id): Retrieves a course object from the database.
        is_user_enrolled(user, course): Checks if a user is enrolled in a course.
        update_user_presence(is_online): Updates the user's presence status.
        user_presence_update(event): Sends a user presence update to the WebSocket client.
    """
    
    async def connect(self):
        self.room_type = self.scope['url_route']['kwargs']['room_type']
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.user = self.scope['user']

        if self.room_type not in ['private', 'course']:
            await self.close(code=4003)
            return

        if self.room_type == 'private':
            other_user_id = self.room_id
            if self.user.id == int(other_user_id):
                await self.close(code=4003)
                return

            user_ids = sorted([str(self.user.id), other_user_id])
            self.room_name = f'private_chat_{user_ids[0]}_{user_ids[1]}'
        else:
            self.course_id = self.room_id
            try:
                self.course = await self.get_course(self.course_id)
            except Course.DoesNotExist:
                await self.close(code=4004)
                return

            if not await self.is_user_enrolled(self.user, self.course):
                await self.close(code=4003)
                return

            self.room_name = f'course_chat_{self.course.id}'

        self.room_group_name = f'chat_{self.room_name}'

        if self.channel_layer is not None:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        await self.accept()
        await self.send_recent_messages()

    async def disconnect(self, _):
        if self.channel_layer is not None:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        await self.update_user_presence(False)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get("message")
        action = text_data_json.get("action")

        if action == "typing":
            if self.channel_layer is not None:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "typing_indicator",
                        "user": self.user.username,
                        "is_typing": text_data_json.get("is_typing", False),
                    },
                )
        elif action == "message":
            await self.save_message(message)
            if self.channel_layer is not None:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": message,
                        "user": self.user.username,
                    },
                )

    async def chat_message(self, event):
        message = event["message"]
        user = event["user"]
        await self.send(
            text_data=json.dumps(
                {
                    "type": "chat_message",
                    "message": message,
                    "user": user,
                    "timestamp": timezone.now().isoformat(),
                }
            )
        )

    async def typing_indicator(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing_indicator",
                    "user": event["user"],
                    "is_typing": event["is_typing"],
                }
            )
        )

    @database_sync_to_async
    def save_message(self, message):
        chat_room_ref = db.collection('chatRooms').document(self.room_name)
        chat_room_ref.update({
            'messages': ArrayUnion([{
                'sender': self.user.username,
                'message': message,
                'timestamp': SERVER_TIMESTAMP
            }])
        })

    
    @database_sync_to_async
    def get_recent_messages(self):
        messages_ref = db.collection('chatRooms').document(self.room_name).collection('messages')
        messages = messages_ref.order_by('timestamp', direction=Query.DESCENDING).limit(20).get()
        return [{'message': message.to_dict()['message'],
                 'user': message.to_dict()['sender'],
                 'timestamp': message.to_dict()['timestamp']} for message in messages]
    
    async def send_recent_messages(self):
        recent_messages = await self.get_recent_messages()
        for message in recent_messages:
            await self.send(text_data=json.dumps({
                'type': 'chat_message',
                'message': message['message'],
                'user': message['user'],
                'timestamp': message['timestamp'],
            }))

    @database_sync_to_async
    def get_course(self, course_id):
        return Course.objects.get(pk=course_id)

    @database_sync_to_async
    def is_user_enrolled(self, user, course):
        return user.enrollments.filter(course=course).exists()

    async def update_user_presence(self, is_online):
        if self.channel_layer is not None:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "user_presence_update",
                    "user": self.user.username,
                    "is_online": is_online,
                },
            )

    async def user_presence_update(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_presence",
                    "user": event["user"],
                    "is_online": event["is_online"],
                }
            )
        )