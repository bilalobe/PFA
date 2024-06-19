from django.db import IntegrityError
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status
from rest_framework.exceptions import ValidationError

from backend.eplatform_backend.exceptions import custom_exception_handler
from .serializers import MyCustomTokenObtainPairSerializer
from backend.user.serializers import UserCreateSerializer
import logging

logger = logging.getLogger(__name__)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyCustomTokenObtainPairSerializer

@api_view(['GET'])
def api_root(request, format=None):
    endpoints = {
        'users': 'user:user-list',
        'courses': 'course:course-list',
        'enrollments': 'enrollment:enrollment-list',
        'forums': 'forum:forum-list',
        'resources': 'resource:resource-list',
        'moderation': 'moderation:moderation-list',
        'chat': 'chat:chat-list',
        'quizzes': 'quiz:quiz-list',
        'modules': 'module:module-list',
        'messages': 'chat:chatmessage-list',
        'chatrooms': 'chat:chatroom-list',
        'ai': 'ai:ai-list',
        'generator': 'ai:generator-list',
    }
    return Response({key: reverse(value, request=request, format=format) for key, value in endpoints.items()})

@api_view(['POST'])
@permission_classes([AllowAny])
def registration_view(request):
    """
    API endpoint for user registration.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        Response: The HTTP response object containing the result of the registration.

    Raises:
        IntegrityError: If a user with the same username already exists.
        ValidationError: If the registration data is invalid.
        Exception: If an unexpected error occurs during registration.
    """
    if request.method != 'POST':
        return Response({'error': 'Invalid request method.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    serializer = UserCreateSerializer(data=request.data)
    try:
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({'user': serializer.data, 'message': 'User registered successfully.'}, status=status.HTTP_201_CREATED)
    except IntegrityError as e:
        logger.error(f'User registration failed due to integrity error: {e}', exc_info=True)
        return Response({'error': 'A user with that username already exists.'}, status=status.HTTP_409_CONFLICT)
    except ValidationError as ve:
        logger.error(f'Validation error during registration: {ve}', exc_info=True)
        return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f'Unexpected error during registration: {e}', exc_info=True)
        return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    if request.method != 'POST':
        return Response({'error': 'Invalid request method.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    serializer = MyCustomTokenObtainPairSerializer(data=request.data)
    try:
        if serializer.is_valid(raise_exception=True):
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
    except ValidationError as ve:
        logger.error(f'Validation error during login: {ve}', exc_info=True)
        return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        logger.error(f'Unexpected error in login_view: {exc}', exc_info=True)
        response = custom_exception_handler(exc, {'view': 'login_view'})
        if response is None:
            response = JsonResponse({'error': 'An unexpected error occurred.'}, status=500)
        return response