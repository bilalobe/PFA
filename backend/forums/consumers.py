import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .serializers import PostSerializer, CommentSerializer, ModerationSerializer


class ModerationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.room_group_name = "moderation_updates"

        # Join the room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get("message")

        # Handle received messages if needed
        if message:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "moderation_action",
                    "message": message,
                },
            )

    async def moderation_action(self, event):
        moderation_data = event.get("moderation_data")
        moderation = ModerationSerializer(moderation_data).data
        await self.send(
            text_data=json.dumps(
                {
                    "type": "moderation_action",
                    "moderation": moderation,
                }
            )
        )

    async def new_post(self, event):
        post_data = event.get("post_data")
        post = PostSerializer(post_data).data
        await self.send(
            text_data=json.dumps(
                {
                    "type": "new_post",
                    "post": post,
                }
            )
        )

    async def new_comment(self, event):
        comment_data = event.get("comment_data")
        comment = CommentSerializer(comment_data).data
        await self.send(
            text_data=json.dumps(
                {
                    "type": "new_comment",
                    "comment": comment,
                }
            )
        )

    async def send_join_notification(self):
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "user_joined", "user": self.user.username}
        )

    async def send_leave_notification(self):
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "user_left", "user": self.user.username}
        )

    async def user_joined(self, event):
        await self.send(
            text_data=json.dumps({"type": "user_joined", "user": event["user"]})
        )

    async def user_left(self, event):
        await self.send(
            text_data=json.dumps({"type": "user_left", "user": event["user"]})
        )


class ForumConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.room_group_name = "forum_updates"  # Global forum updates group

        # Check if specific thread ID is provided in the URL route
        self.thread_id = self.scope["url_route"].get("kwargs", {}).get("thread_id")
        if self.thread_id:
            self.room_group_name = f"thread_{self.thread_id}"

        # Join the room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

        # Send a join notification to the group (for specific threads)
        if self.thread_id:
            await self.send_join_notification()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        # Send a leave notification to the group (for specific threads)
        if self.thread_id:
            await self.send_leave_notification()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get("message")

        # Handle received messages if needed
        if message:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "forum_message",
                    "message": message,
                },
            )

    async def forum_message(self, event):
        message = event["message"]
        await self.send(
            text_data=json.dumps(
                {
                    "type": "forum_message",
                    "message": message,
                }
            )
        )

    async def forum_update(self, event):
        message = event["message"]
        await self.send(
            text_data=json.dumps(
                {
                    "type": "forum_update",
                    "message": message,
                }
            )
        )

    async def new_post(self, event):
        post_data = event["post_data"]
        post = PostSerializer(post_data).data
        await self.send(
            text_data=json.dumps(
                {
                    "type": "new_post",
                    "post": post,
                }
            )
        )

    async def new_comment(self, event):
        comment_data = event["comment_data"]
        comment = CommentSerializer(comment_data).data
        await self.send(
            text_data=json.dumps(
                {
                    "type": "new_comment",
                    "comment": comment,
                }
            )
        )

    async def moderation_action(self, event):
        moderation_data = event["moderation_data"]
        moderation = ModerationSerializer(moderation_data).data
        await self.send(
            text_data=json.dumps(
                {
                    "type": "moderation_action",
                    "moderation": moderation,
                }
            )
        )

    async def send_join_notification(self):
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "user_joined", "user": self.user.username}
        )

    async def send_leave_notification(self):
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "user_left", "user": self.user.username}
        )

    async def user_joined(self, event):
        await self.send(
            text_data=json.dumps({"type": "user_joined", "user": event["user"]})
        )

    async def user_left(self, event):
        await self.send(
            text_data=json.dumps({"type": "user_left", "user": event["user"]})
        )
