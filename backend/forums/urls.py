from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ForumViewSet,
    ThreadViewSet,
    PostViewSet,
    CommentViewSet,  # Ensure this is imported
    ModerationViewSet,
    take_action,
    moderate_post,
    moderate_comment,  # Ensure this is imported
    moderation_dashboard,
    translate,  # If you have a translate view
)
from forums import consumers

# Setting up REST API routes using DefaultRouter
router = DefaultRouter()
router.register(r"forums", ForumViewSet)
router.register(r"threads", ThreadViewSet)
router.register(r"posts", PostViewSet)
router.register(r"comments", CommentViewSet)
router.register(r"moderation", ModerationViewSet)

# Defining urlpatterns for REST API and WebSocket
urlpatterns = [
    path("", include(router.urls)),
    path("moderate/", moderation_dashboard, name="moderation-dashboard"),
    path("moderate/post/<int:post_id>/", moderate_post, name="moderate_post"),
    path(
        "moderate/comment/<int:comment_id>/", moderate_comment, name="moderate_comment"
    ),
    path("search/", PostViewSet.as_view({"get": "search"}), name="forum-search"),
    path(
        "translate/<int:pk>/", translate, name="translate"
    ),  # If you have a translate view
]

# WebSocket URL patterns
websocket_urlpatterns = [
    path("ws/forum/<str:thread_id>/", consumers.ForumConsumer.as_asgi()),
    path("ws/moderation/", consumers.ModerationConsumer.as_asgi()),
]
