import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatMessage
from django.contrib.auth.models import User
from asgiref.sync import async_to_sync, database_sync_to_async
from channels.layers import get_channel_layer
from courses.models import Course  # Import your Course model
from django.utils import timezone

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope['url_route']['kwargs']['room_type'] == 'private':
            self.other_user_id = self.scope['url_route']['kwargs']['room_id']
            self.user = self.scope['user']

            # Ensure users cannot chat with themselves
            if self.user.id == int(self.other_user_id):
                await self.close(code=4003)
                return

            # Generate a unique room name
            user_ids = sorted([self.user.id, int(self.other_user_id)])
            self.room_name = f'private_chat_{user_ids[0]}_{user_ids[1]}'
            self.room_group_name = f'chat_{self.room_name}'

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        else:
            self.course_id = self.scope['url_route']['kwargs']['room_id']
            self.user = self.scope['user']

            # Check if the course exists
            try:
                self.course = await self.get_course(self.course_id)
            except Course.DoesNotExist:
                await self.close(code=4004)  # Close connection: Course not found
                return

            # Check if the user is enrolled in the course
            if not await self.is_user_enrolled(self.user, self.course):
                await self.close(code=4003)  # Close connection: Not enrolled
                return

            self.room_name = f'course_chat_{self.course_id}'
            self.room_group_name = f'chat_{self.room_name}'

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

        await self.accept()

    async def disconnect(self, code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message')
        action = text_data_json.get('action')

        if action == 'typing' and self.channel_layer is not None:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user': self.scope['user'].username,
                    'is_typing': text_data_json.get('is_typing', False),
                }
            )
        elif action == 'message' and self.channel_layer is not None:
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
