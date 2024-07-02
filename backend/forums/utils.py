from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def send_forum_update(group_name, message):
    """
    Sends a generic forum update message to the specified group.
    """
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        async_to_sync(channel_layer.group_send)(
            group_name, {"type": "forum_update", "message": message}
        )
