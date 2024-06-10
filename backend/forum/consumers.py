# consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ForumConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.thread_id = self.scope['url_route']['kwargs']['thread_id']
        self.thread_group_name = f'thread_{self.thread_id}'

        # Join the thread group
        await self.channel_layer.group_add(
            self.thread_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the thread group
        await self.channel_layer.group_discard(
            self.thread_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Receive a message from WebSocket (if needed)
        text_data_json = json.loads(text_data)

    async def send_new_post(self, event):
        # Send a new post notification to the group
        post_data = event['post_data']
        await self.send(text_data=json.dumps(post_data))

class ModerationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.moderation_group_name = 'moderation'

        await self.channel_layer.group_add(
            self.moderation_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.moderation_group_name,
            self.channel_name
        )

    async def send_moderation_notification(self, event):
        # Send a moderation notification to the group
        moderation_data = event['moderation_data']
        await self.send(text_data=json.dumps(moderation_data))
