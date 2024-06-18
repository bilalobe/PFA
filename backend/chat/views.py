from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from .models import ChatMessage, ChatRoom, Course
from .serializers import ChatMessageSerializer
from .utils import send_chat_message

class ChatMessageViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing chat message instances.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer

    def perform_create(self, serializer):
        """
        Overrides the default perform_create method to handle chat message creation
        with specific logic based on the type of chat room.
        """
        chat_room = serializer.validated_data["chat_room"]
        if chat_room.type == "course":
            course_id = chat_room.course.id
            course = get_object_or_404(Course, pk=course_id)
            serializer.save(sender=self.request.user, course=course)
        else:
            serializer.save(sender=self.request.user)

class ChatRoomViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing chat room instances.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        """
        Overrides the default perform_create method to handle chat room creation
        with specific logic based on the type of chat room.
        """
        if serializer.validated_data["type"] == "course":
            course_id = serializer.validated_data.get("course")
            course = get_object_or_404(Course, pk=course_id)
            serializer.save(course=course)
        else:
            serializer.save()

    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):
        """
        Retrieves chat messages for a specific room.
        """
        chat_room = self.get_object()
        messages = chat_room.messages.all()
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def send_message(self, request, *args, **kwargs):
        """
        Handles sending a message to a chat room. Validates the incoming data,
        saves the message, and then sends it to the chat room.
        """
        chat_room = self.get_object()
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            message_instance = serializer.save(sender=request.user, chat_room=chat_room)[0]
            send_chat_message(
                chat_room.name,
                message_instance.message,  # Access the message directly from the instance
                request.user.username  # Assuming send_chat_message expects a username
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    queryset = ChatRoom.objects.all()