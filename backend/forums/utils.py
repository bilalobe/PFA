from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import PostSerializer, CommentSerializer


def send_forum_update(group_name, message):
    """
    Sends a generic forum update message to the specified group.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        group_name, {"type": "forum_update", "message": message}
    )


def send_new_post_notification(post, request):
    """
    Sends a new post notification to the corresponding thread group.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"thread_{post.thread.id}",
        {
            "type": "new_post",
            "post_data": PostSerializer(post, context={"request": request}).data,
        },
    )


def send_new_comment_notification(comment, request):
    """
    Sends a new comment notification to the corresponding thread group.
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
