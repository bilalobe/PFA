# asgi.py

import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from forum.consumers import ForumConsumer, ModerationConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dj_ango.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter([
            path('ws/forum/<str:thread_id>/', ForumConsumer.as_asgi()),
            path('ws/moderation/', ModerationConsumer.as_asgi()),
        ])
    ),
})
