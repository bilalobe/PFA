"""
ASGI config for eplatform_backend project.

It exposes the ASGI callable as a module-level variable named `application`.
For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path, re_path
from backend.chat.consumers import ChatConsumer
from forums.consumers import ForumConsumer, ModerationConsumer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dj_ango.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(
            URLRouter(
                [
                    path("ws/forum/<str:thread_id>/", ForumConsumer.as_asgi()),
                    path("ws/moderation/", ModerationConsumer.as_asgi()),
                    re_path(r"ws/forum/(?P<thread_id>\d+)/$", ForumConsumer.as_asgi()),
                    re_path(r"ws/chat/(?P<room_name>\w+)/$", ChatConsumer.as_asgi()),
                ]
            )
        ),
    }
)
