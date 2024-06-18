import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from backend.moderation.serializers import ModerationSerializer
from backend.forums.serializers import PostSerializer
from backend.comments.serializers import CommentSerializer

class ModerationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Connects the consumer to the WebSocket.
        """
        self.user = self.scope["user"]
        self.room_group_name = "moderation_updates"
        self.channel_layer = get_channel_layer()

        if self.channel_layer is None:
            return

        if self.channel_layer is not None:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, _):
        """
        Disconnects the consumer from the WebSocket.
        """
        if self.channel_layer is not None:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Receives data from the WebSocket.
        """
        text_data_json = json.loads(text_data)
        message = text_data_json.get("message")

        if message:
            if self.channel_layer is not None:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "moderation_action",
                        "message": message,
                    },
                )

    async def moderation_action(self, event):
        """
        Handles a moderation action event by sending the moderation data to the client.
        """
        moderation_data = event.get("moderation_data")
        if moderation_data is None:
            return
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
        """
        Handles a new post event by sending the post data to the client.
        """
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
        """
        Handles a new comment event by sending the comment data to the client.
        """
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
        """
        Sends a notification to the group indicating a user has joined.
        """
        if self.channel_layer is not None:
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "user_joined", "user": self.user.username}
            )

    async def send_leave_notification(self):
        """
        Sends a notification to the group indicating a user has left.
        """
        if self.channel_layer is not None:
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "user_left", "user": self.user.username}
            )

    async def user_joined(self, event):
        """
        Handles a user joined event by sending the user's name to the client.
        """
        if "user" not in event or event["user"] is None:
            return
        await self.send(
            text_data=json.dumps({"type": "user_joined", "user": event["user"]})
        )

    async def user_left(self, event):
        """
        Handles a user left event by sending the user's name to the client.
        """
        if "user" not in event or event["user"] is None:
            return
        await self.send(
            text_data=json.dumps({"type": "user_left", "user": event["user"]})
        )


class ForumConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Connects the consumer to the WebSocket.
        """
        self.user = self.scope["user"]
        self.room_group_name = "forum_updates"
        self.channel_layer = get_channel_layer()

        self.thread_id = self.scope["url_route"].get("kwargs", {}).get("thread_id")
        if self.thread_id:
            self.room_group_name = f"thread_{self.thread_id}"
        if self.channel_layer is not None:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        if self.thread_id:
            await self.send_join_notification()

    async def disconnect(self, _):
        """
        Disconnects the consumer from the WebSocket.
        """
        if self.channel_layer is not None:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        if self.thread_id:
            await self.send_leave_notification()

    async def receive(self, text_data):
        """
        Receives data from the WebSocket.
        """
        text_data_json = json.loads(text_data)
        message = text_data_json.get("message")

        if message:
            if self.channel_layer is not None:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "forum_message",
                        "message": message,
                    },
                )

    async def forum_message(self, event):
        """
        Handles a forum message event by sending the message to the client.
        """
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
        """
        Handles a forum update event by sending the message to the client.
        """
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
        """
        Handles a new post event by sending the post data to the client.
        """
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
        """
        Handles a new comment event by sending the comment data to the client.
        """
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
        """
        Handles a moderation action event by sending the moderation data to the client.
        """
        moderation_data = event.get("moderation_data")
        if moderation_data is None:
            return
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
        """
        Sends a notification to the group indicating a user has joined.
        """
        if self.room_group_name is None or self.user.username is None or self.channel_layer is None:
            return
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "user_joined", "user": self.user.username}
        )

    async def send_leave_notification(self):
        """
        Sends a notification to the group indicating a user has left.
        """
        if self.room_group_name is None or self.user.username is None or self.channel_layer is None:
            return
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "user_left", "user": self.user.username}
        )

    async def user_joined(self, event):
        """
        Handles a user joined event by sending the user's name to the client.
        """
        if "user" not in event or event["user"] is None:
            return
        await self.send(
            text_data=json.dumps({"type": "user_joined", "user": event["user"]})
        )

    async def user_left(self, event):
        """
        Handles a user left event by sending the user's name to the client.
        """
        if "user" not in event or event["user"] is None:
            return
        await self.send(
            text_data=json.dumps({"type": "user_left", "user": event["user"]})
        )