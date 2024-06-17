from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import ModerationSerializer


def send_moderation_notification(moderation, request):
    """
    Sends a moderation notification to the moderation group.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "moderation",
        {
            "type": "moderation_action",
            "moderation_data": ModerationSerializer(
                moderation, context={"request": request}
            ).data,
        },
    )
