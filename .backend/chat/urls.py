from django.urls import path
from . import views

urlpatterns = [
    path('', views.chat_rooms, name='chat-rooms'), 
    path('<str:chat_room_id>/', views.chat_room_detail, name='chat-room-detail'),
    path('<str:chat_room_id>/messages/', views.chat_messages, name='chat-messages'),
    path('<str:chat_room_id>/typing/', views.send_typing_notification, name='send-typing-notification'), 
]