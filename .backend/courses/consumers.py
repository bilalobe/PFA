from channels.generic.websocket import AsyncWebsocketConsumer
import json

class QuizProgressConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['quiz_attempt_id']
        self.room_group_name = f'quiz_{self.room_name}'

        if self.channel_layer is not None:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

        await self.accept()

    async def disconnect(self, close_code):
        if self.channel_layer is not None:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        if self.channel_layer is not None:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_progress',
                    'message': message
                }
            )

    async def update_progress(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'message': message
        }))
