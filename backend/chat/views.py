from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChatRoom, ChatMessage
from .serializers import ChatRoomSerializer, ChatMessageSerializer
from courses.models import Course
from user.models import User
from .utils import send_chat_message, send_typing_notification

class ChatRoomViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing chat rooms.
    """
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if serializer.validated_data['type'] == 'course':
            course_id = serializer.validated_data.get('course')
            course = get_object_or_404(Course, pk=course_id)
            serializer.save(course=course)
        else:
            serializer.save()

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """
        Retrieves chat messages for a specific room.
        """
        chat_room = self.get_object()
        messages = chat_room.messages.all()
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """
        Handles sending a message to a chat room.
        """
        chat_room = self.get_object()
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=self.request.user, chat_room=chat_room)
            send_chat_message(chat_room.name, serializer.data['message'], self.request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def typing(self, request, pk=None):
        """
        Handles sending a typing notification.
        """
        chat_room = self.get_object()
        is_typing = request.data.get('is_typing')
        if is_typing is not None:
            send_typing_notification(chat_room.name, self.request.user, is_typing)
            return Response({'status': 'ok'})
        else:
            return Response({'error': 'is_typing field is required.'}, status=status.HTTP_400_BAD_REQUEST)

class ChatMessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing chat messages.
    """
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        chat_room_id = self.kwargs.get('chat_room_pk')
        chat_room = get_object_or_404(ChatRoom, pk=chat_room_id)
        serializer.save(sender=self.request.user, chat_room=chat_room)