from backend.posts.serializers import PostSerializer
from backend.comments.serializers import CommentSerializer
from backend.moderation.serializers import ModerationSerializer
import json

class ForumEventHandlersMixin:
    def __init__(self):
        self.event_handler_map = {
            "forum_message": self.handle_forum_message,
            "forum_update": self.handle_forum_update,
            "new_post": self.handle_new_post,
            "new_comment": self.handle_new_comment,
            "moderation_action": self.handle_moderation_action,
            "user_joined": self.handle_user_joined,
            "user_left": self.handle_user_left,
        }

    async def send_json(self, data):
        if hasattr(self, 'channel_layer') and hasattr(self, 'channel_name'):
            await self.channel_layer.send(self.channel_name, { # type: ignore
                "type": "websocket.send",
                "text": json.dumps(data)
            })
        else:
            raise AttributeError("The class using ForumEventHandlersMixin must have 'channel_layer' and 'channel_name' attributes.")

    async def handle_event(self, event_type, event):
        handler = self.event_handler_map.get(event_type)
        if handler:
            await handler(event)

    async def handle_forum_message(self, event):
        await self.send_json({"type": "forum_message", "message": event["message"]})

    async def handle_forum_update(self, event):
        await self.send_json({"type": "forum_update", "message": event["message"]})

    async def handle_new_post(self, event):
        post = PostSerializer(event["post_data"]).data
        await self.send_json({"type": "new_post", "post": post})

    async def handle_new_comment(self, event):
        comment = CommentSerializer(event["comment_data"]).data
        await self.send_json({"type": "new_comment", "comment": comment})

    async def handle_moderation_action(self, event):
        moderation_data = event.get("moderation_data")
        if moderation_data:
            moderation = ModerationSerializer(moderation_data).data
            await self.send_json({"type": "moderation_action", "moderation": moderation})

    async def handle_user_joined(self, event):
        await self.send_json({"type": "user_joined", "user": event.get("user")})

    async def handle_user_left(self, event):
        await self.send_json({"type": "user_left", "user": event.get("user")})