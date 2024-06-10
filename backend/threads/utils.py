from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import ThreadSerializer

def send_new_thread_notification(thread, request):
    """
    Sends a notification through the forum_updates channel group when a new thread is created.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'forum_updates',
        {
            'type': 'forum_update',
            'message': {
                'type': 'new_thread',
                'thread': ThreadSerializer(thread, context={'request': request}).data
            }
        }
    )