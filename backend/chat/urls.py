from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import ChatRoomViewSet, ChatMessageViewSet

router = DefaultRouter()
router.register(r"chatrooms", ChatRoomViewSet, basename="chatroom")
chatrooms_router = routers.NestedSimpleRouter(router, r"chatrooms", lookup="chat_room")
chatrooms_router.register(r"messages", ChatMessageViewSet, basename="chatroom-message")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(chatrooms_router.urls)),
]
