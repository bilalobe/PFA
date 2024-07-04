from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def send_new_comment_notification(comment_data, request):
    """
    Sends a new comment notification through the corresponding thread group.
    """
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        post_id = comment_data.get('post_id')
        if post_id:
            async_to_sync(channel_layer.group_send)(
                f"thread_{post_id}",
                {
                    "type": "new_comment",
                    "comment_data": comment_data,
                },
            )