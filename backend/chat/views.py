import logging
import os
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound, PermissionDenied
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from google.cloud import aiplatform
from backend.chat.serializers import ChatMessageSerializer, ChatRoomSerializer
from .utils import get_chat_room, send_chat_message, send_typing_notification
from backend.common.firebase_admin_init import db
from google.cloud import firestore
from ..eplatform_backend.sentry_conf import *

logger = logging.getLogger(__name__)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def chat_rooms(request):
    """
    API endpoint for retrieving and creating chat rooms.

    GET: Retrieves a list of all chat rooms.
    POST: Creates a new chat room.

    Returns:
        - GET: A list of chat rooms in the format:
            [
                {
                    'id': <chat_room_id>,
                    ...<other chat room data>
                },
                ...
            ]
        - POST: The created chat room data in the format:
            {
                'id': <chat_room_id>,
                ...<other chat room data>
            }

    Raises:
        - GET: HTTP_500_INTERNAL_SERVER_ERROR if there is an error retrieving chat rooms.
        - POST: HTTP_400_BAD_REQUEST if the chat room data is invalid.
                HTTP_500_INTERNAL_SERVER_ERROR if there is an error creating the chat room.
    """
    if request.method == 'GET':
        try:
            chat_rooms_data = db.collection('chatRooms').get()
            chat_rooms = [
                {
                    'id': doc.id,
                    **doc.to_dict()
                } for doc in chat_rooms_data
            ]
            return Response(chat_rooms, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching chat rooms: {e}")
            return Response({'error': 'Failed to retrieve chat rooms.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        serializer = ChatRoomSerializer(data=request.data)
        if serializer.is_valid():
            try:
                chat_room_data = serializer.validated_data
                if isinstance(chat_room_data, dict):
                    new_chat_room_ref = db.collection('chatRooms').add(chat_room_data)
                    chat_room_data['id'] = new_chat_room_ref[1].id
                    return Response(chat_room_data, status=status.HTTP_201_CREATED)
                else:
                    return Response({'error': 'Invalid chat room data.'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error creating chat room: {e}")
                return Response({'error': 'Failed to create chat room.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def chat_room_detail(request, chat_room_id):
    """
    Retrieve, update or delete a chat room.

    Args:
        request (HttpRequest): The HTTP request object.
        chat_room_id (str): The ID of the chat room.

    Returns:
        HttpResponse: The HTTP response containing the chat room data or an error message.

    Raises:
        NotFound: If the chat room is not found.
        PermissionDenied: If the user does not have permission to delete the chat room.
    """
    chat_room_ref = db.collection('chatRooms').document(chat_room_id)
    try:
        chat_room_doc = chat_room_ref.get()
        if not chat_room_doc.exists:
            raise NotFound("Chat room not found.")
    except Exception as e:
        logger.error(f"Error fetching chat room: {e}")
        return Response({'error': 'Failed to retrieve chat room.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == 'GET':
        if chat_room_doc.exists:
            chat_room_data = chat_room_doc.to_dict()
            if chat_room_data is not None:  # Check if chat_room_data is not None before adding 'id'
                chat_room_data['id'] = chat_room_doc.id
                return Response(chat_room_data, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Chat room data is not available.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Chat room not found.'}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'POST':
        serializer = ChatRoomSerializer(data=request.data)
        if serializer.is_valid():
            try:
                chat_room_data = serializer.validated_data
                if isinstance(chat_room_data, dict):
                    chat_room_ref.update(chat_room_data)
                    updated_chat_room_doc = chat_room_ref.get()  # Fetch the updated document
                    if updated_chat_room_doc.exists:  # Ensure the document exists before converting to dict
                        updated_chat_room_data = updated_chat_room_doc.to_dict()
                        if updated_chat_room_data is not None:  # Check if updated_chat_room_data is not None before adding 'id'
                            updated_chat_room_data['id'] = updated_chat_room_doc.id
                            return Response(updated_chat_room_data, status=status.HTTP_200_OK)
                        else:
                            return Response({'error': 'Failed to update chat room data.'}, status=status.HTTP_404_NOT_FOUND)
                    else:
                        return Response({'error': 'Failed to update chat room.'}, status=status.HTTP_404_NOT_FOUND)
                else:
                    return Response({'error': 'Invalid chat room data.'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error updating chat room: {e}")
                return Response({'error': 'Failed to update chat room.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not request.user.user_type == 'teacher':
            raise PermissionDenied("You do not have permission to delete this chat room.")
        try:
            chat_room_ref.delete()
            return Response({'message': 'Chat room deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting chat room: {e}")
            return Response({'error': 'Failed to delete chat room.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def chat_messages(request, chat_room_id):
    """
    Retrieve or create chat messages for a specific chat room.

    Args:
        request (HttpRequest): The HTTP request object.
        chat_room_id (str): The ID of the chat room.

    Returns:
        HttpResponse: The HTTP response containing the chat messages or an error message.

    Raises:
        NotFound: If the chat room does not exist.

    """
    chat_room_ref = db.collection('chatRooms').document(chat_room_id)
    try:
        chat_room_doc = chat_room_ref.get()
        if not chat_room_doc.exists:
            raise NotFound("Chat room not found.")
    except Exception as e:
        logger.error(f"Error fetching chat room: {e}")
        return Response({'error': 'Failed to retrieve chat room.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == 'GET':
        try:
            messages_ref = chat_room_ref.collection('messages').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(50)
            messages = [msg.to_dict() for msg in messages_ref.stream()]
            for i, message in enumerate(messages):
                message['id'] = str(i)
            serializer = ChatMessageSerializer(data=messages, many=True)
            serializer.is_valid()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching chat messages: {e}")
            return Response({'error': 'Failed to retrieve chat messages.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            try:
                message_data = serializer.validated_data
                if isinstance(message_data, dict):
                    message_ref = chat_room_ref.collection('messages').add(message_data)
                    message_data['id'] = message_ref[1].id
                    send_chat_message(chat_room_id, message_data['message'], request.user)
                    return Response(message_data, status=status.HTTP_201_CREATED)
                else:
                    return Response({'error': 'Invalid message data.'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error adding chat message: {e}")
                return Response({'error': 'Failed to send message.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_typing_notification(request, chat_room_id):
    """
    Send a typing notification to a chat room.

    Args:
        request (Request): The HTTP request object.
        chat_room_id (int): The ID of the chat room.

    Returns:
        Response: The HTTP response object.

    Raises:
        Exception: If there is an error sending the typing notification.
    """
    try:
        chat_room = get_chat_room(chat_room_id)
        if chat_room is None:
            return Response({'error': 'Chat room not found.'}, status=status.HTTP_404_NOT_FOUND)
        is_typing = request.data.get('is_typing')
        if is_typing is not None:
            send_typing_notification(chat_room['id'], request.user, is_typing)
            return Response({'status': 'ok'})
        else:
            return Response({'error': 'is_typing field is required.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error sending typing notification: {e}")
        return Response({'error': 'Failed to send typing notification.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@login_required
def chat_room_list(request):
    """
    View function that retrieves the chat rooms for the logged-in user and renders them in the chat room list template.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: The HTTP response object containing the rendered chat room list template.
    """
    user = request.user
    private_chat_rooms = db.collection('chatRooms').where('chat_type', '==', 'private').where('users', 'array_contains', user.id).get()
    course_chat_rooms = db.collection('chatRooms').where('chat_type', '==', 'course').where('course__enrollments__student', 'array_contains', user.id).get()

    context = {
        'private_chat_rooms': [room.to_dict() for room in private_chat_rooms],
        'course_chat_rooms': [room.to_dict() for room in course_chat_rooms],
    }
    return render(request, 'chat/chat_room_list.html', context)

@login_required
def chat_room(request, room_id):
    """
    Renders the chat room page with the specified room ID.

    Args:
        request (HttpRequest): The HTTP request object.
        room_id (str): The ID of the chat room.

    Returns:
        HttpResponse: The rendered chat room page.

    Raises:
        NotFound: If the chat room with the specified ID does not exist.
    """
    chat_room_ref = db.collection('chatRooms').document(room_id)
    chat_room_doc = chat_room_ref.get()
    if not chat_room_doc.exists:
        raise NotFound("Chat room not found.")
    chat_room_data = chat_room_doc.to_dict()
    messages_ref = chat_room_ref.collection('messages').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(50)
    messages = messages_ref.stream()

    context = {
        'chat_room': chat_room_data,
        'messages': [message.to_dict() for message in messages],
    }
    return render(request, 'chat/chat_room.html', context)

@login_required
@api_view(['POST'])
def ask_gemini(request):
    """
    Endpoint for asking a question to the Gemini AI model.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        Response: The HTTP response object containing the predictions from the Gemini AI model.

    Raises:
        ValueError: If the 'prompt' parameter is missing in the request data.
        Exception: If there is an error during the prediction process.
    """
    prompt = request.data.get('prompt')
    if not prompt:
        return Response({"error": "Prompt is required"}, status=400)

    # Fetch configuration from environment variables
    project = os.environ.get('GOOGLE_PROJECT_ID')
    location = os.environ.get('GOOGLE_API_LOCATION')
    endpoint_name = os.environ.get('GEMINI_ENDPOINT_NAME')

    # Placeholder for authentication and authorization logic
    # Ensure the request is from an authenticated and authorized user
    # if not request.user.is_authenticated:
    #    return Response({"error": "Authentication required"}, status=401)

    try:
        # Initialize the AI Platform with the specified project and location
        aiplatform.init(project=project, location=location)

        endpoint = aiplatform.Endpoint(endpoint_name)

        response = endpoint.predict(instances=[{"prompt": prompt}])

        # Return the predictions in the response
        return Response(response.predictions)
    except Exception as e:
        return Response({"error": str(e)}, status=500)