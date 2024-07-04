from django.urls import path, include
from rest_framework.routers import DefaultRouter

from backend.moderation.views import ModerationViewSet, moderation_dashboard
from backend.forums.views import ForumViewSet
from backend.threads.views import ThreadViewSet
from backend.posts.views import PostViewSet
from backend.comments.views import CommentViewSet
from forums.consumers import ForumConsumer
from moderation.consumers import ModerationConsumer
from backend.AI.views import translate_text

# Setting up REST API routes using DefaultRouter
router = DefaultRouter()
router.register(r"forums", ForumViewSet)
router.register(r"threads", ThreadViewSet)
router.register(r"posts", PostViewSet)
router.register(r"comments", CommentViewSet)
router.register(r"moderation", ModerationViewSet)

# Defining urlpatterns for REST API
urlpatterns = [
    path("", include(router.urls)),
    path("moderate/", moderation_dashboard, name="moderation-dashboard"),
    path("search/", PostViewSet.as_view({"get": "search"}), name="forum-search"),
    path("translate/<int:pk>/", translate_text, name="translate"),
]

# WebSocket URL patterns
websocket_urlpatterns = [
    path("ws/forum/<str:thread_id>/", ForumConsumer.as_asgi()),
    path("ws/moderation/", ModerationConsumer.as_asgi()),
]