from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import CommentSerializer


def send_new_comment_notification(comment, request):
    """
    Sends a new comment notification through the corresponding thread group.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"thread_{comment.post.thread.id}",
        {
            "type": "new_comment",
            "comment_data": CommentSerializer(
                comment, context={"request": request}
            ).data,
        },
    )
