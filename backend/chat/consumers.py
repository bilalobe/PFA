import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatMessage, ChatRoom
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from courses.models import Course
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"
        self.user = self.scope["user"]

        # Join the room group
        channel_layer = get_channel_layer()
        if channel_layer is not None:
            await channel_layer.group_add(self.room_group_name, self.channel_name)
            if hasattr(channel_layer, "group_send"):
                await channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "user_presence_update",
                        "user": self.user.username,
                        "is_online": True,
                    },
                )
        else:
            return await self.close()

        # Update user presence
        await self.update_user_presence(True)
        await self.send_recent_messages()

        await self.accept()

    async def disconnect(self, _):
        # Leave room group
        channel_layer = get_channel_layer()
        if channel_layer is not None:
            await channel_layer.group_discard(self.room_group_name, self.channel_name)
    
        # Update user presence
        await self.update_user_presence(False)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get("message")
        action = text_data_json.get("action")
    
        # Ensure channel_layer is initialized
        if self.channel_layer is not None:
            if action == "typing":
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
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": message,
                        "user": self.user.username,
                    },
                )
        else:
            print("channel_layer is not initialized.")

    # Send message to WebSocket
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
        # Send typing indicator event to client
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
        ChatMessage.objects.create(
            chat_room=ChatRoom.objects.get(name=self.room_name),
            sender=self.user,
            message=message,
        )

    @database_sync_to_async
    def get_recent_messages(self):
        return ChatMessage.objects.filter(chat_room__name=self.room_name).order_by(
            "-timestamp"
        )[:20]

    async def send_recent_messages(self):
        recent_messages = await self.get_recent_messages()
        for message in recent_messages:
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "chat_message",
                        "message": message.message,
                        "user": message.sender.username,
                        "timestamp": message.timestamp.isoformat(),
                    }
                )
            )

    @database_sync_to_async
    def get_course(self, course_id):
        return Course.objects.get(pk=course_id)

    @database_sync_to_async
    def is_user_enrolled(self, user, course):
        return user.enrollments.filter(course=course).exists()

    async def update_user_presence(self, is_online):
        """
        Updates user presence in the room.
        """
        # Ensure channel_layer is properly initialized before using it
        if self.channel_layer is not None:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "user_presence_update",
                    "user": self.user.username,
                    "is_online": is_online,
                },
            )
        else:
            print("channel_layer is not initialized.")
        

    async def user_presence_update(self, event):
        """
        Handles user presence updates.
        """
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_presence",
                    "user": event["user"],
                    "is_online": event["is_online"],
                }
            )
        )
