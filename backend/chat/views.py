from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from .models import ChatMessage, ChatRoom, Course
from .serializers import ChatMessageSerializer


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

    This viewset provides the following actions:
    - perform_create: Overrides the default perform_create method to handle chat room creation
      with specific logic based on the type of chat room.
    - messages: Retrieves chat messages for a specific room.
    - send_message: Sends a message to the chat room and simulates a chatbot response.

    Attributes:
        permission_classes (list): A list of permission classes for the viewset.
        queryset (QuerySet): The queryset of ChatRoom objects.

    Methods:
        perform_create: Overrides the default perform_create method to handle chat room creation
        with specific logic based on the type of chat room.
        messages: Retrieves chat messages for a specific room.
        send_message: Sends a message to the chat room and simulates a chatbot response.
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
        Sends a message to the chat room and simulates a chatbot response.

        Args:
            request (Request): The HTTP request object.

        Returns:
            Response: The HTTP response object containing the serialized user message data
            and the status code.

        Raises:
            HTTP 400 Bad Request: If the user message serializer is not valid.
        """
        chat_room = self.get_object()
        user_message_serializer = ChatMessageSerializer(data=request.data)
        if user_message_serializer.is_valid():
            user_message_instance = user_message_serializer.save(
                sender=request.user, chat_room=chat_room
            )
            # Simulate chatbot response
            bot_response = "This is a response from the chatbot."
            bot_message_serializer = ChatMessageSerializer(
                data={
                    "chat_room": chat_room.id,
                    "message": bot_response,
                    "sender": None,  # Assuming your model allows for a bot sender
                }
            )
            if bot_message_serializer.is_valid():
                bot_message_serializer.save()  # Save bot response as a new message
            return Response(
                user_message_serializer.data, status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                user_message_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

    queryset = ChatRoom.objects.all()
