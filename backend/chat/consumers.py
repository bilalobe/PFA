# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import ChatMessage

class ChatConsumer(AsyncWebsocketConsumer): 
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Add user to online users list
        await self.add_user_to_online()
        await self.send_online_users()

        await self.send_recent_messages()

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Remove user from online users list
        await self.remove_user_from_online()
        await self.send_online_users()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        action = text_data_json.get('action')

        if action == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user': self.scope['user'].username,
                    'is_typing': text_data_json.get('is_typing', False),
                }
            )
        elif action == 'message':
            await self.save_message(message)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'user': self.scope['user'].username,
                }
            )

    async def chat_message(self, event):
        message = event['message']
        user = event['user']

        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message,
            'user': user,
            'timestamp': timezone.now().isoformat(),
        }))

    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing_indicator',
            'user': event['user'],
            'is_typing': event['is_typing'],
        }))

    @database_sync_to_async
    def save_message(self, message):
        ChatMessage.objects.create(
            room_name=self.room_name,
            user=self.scope['user'],
            message=message
        )

    @database_sync_to_async
    def add_user_to_online(self):
        # Your logic to add user to online list, e.g., using Redis or a database
        pass

    @database_sync_to_async
    def remove_user_from_online(self):
        # Your logic to remove user from online list, e.g., using Redis or a database
        pass

    @database_sync_to_async
    def get_recent_messages(self):
        return ChatMessage.objects.filter(room_name=self.room_name).order_by('-timestamp')[:20]  # Get last 20 messages

    async def send_recent_messages(self):
        recent_messages = await self.get_recent_messages()
        for message in recent_messages:
            await self.send(text_data=json.dumps({
                'type': 'chat_message',
                'message': message.message,
                'user': message.user.username,
                'timestamp': message.timestamp.isoformat(),
            }))

    async def send_online_users(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'online_users',
                'users': await self.get_online_users(),
            }
        )

    @database_sync_to_async
    def get_online_users(self):
        # Your logic to get online users, e.g., using Redis or a database
        return ["User1", "User2"]  # Replace with actual online users logic

    async def online_users(self, event):
        await self.send(text_data=json.dumps({
            'type': 'online_users',
            'users': event['users'],
        }))
