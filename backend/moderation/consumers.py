import json
from backend.moderation.serializers import ModerationReportSerializer
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer


class ModerationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Connects the consumer to the WebSocket and adds it to the 'moderation_updates' group.
        """
        self.user = self.scope["user"]
        self.room_group_name = "moderation_updates"
        self.channel_layer = get_channel_layer()

        if self.channel_layer is not None:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, _):
        """
        Disconnects the consumer from the WebSocket and removes it from the 'moderation_updates' group.
        """
        if self.channel_layer is not None:
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

    async def moderation_action(self, event):
        """
        Handles a moderation action event by sending the moderation data to the client.
        """
        moderation_data = event.get("moderation_data")
        if moderation_data is None:
            return
        moderation = ModerationReportSerializer(moderation_data).data
        await self.send(
            text_data=json.dumps(
                {
                    "type": "moderation_action",
                    "moderation": moderation,
                }
            )
        )