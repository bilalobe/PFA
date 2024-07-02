from django.db import IntegrityError
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import ValidationError

from backend.common.exceptions import custom_exception_handler
from backend.users.serializers import UserCreateSerializer
from .serializers import MyCustomTokenObtainPairSerializer
import logging

logger = logging.getLogger(__name__)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyCustomTokenObtainPairSerializer

@api_view(["GET"])
def api_root(request, format=None):
    """API root view that lists all available endpoints."""
    endpoints = {
        "users": "user:user-list",
        "posts": "post:post-list",
        "threads": "thread:thread-list",
        "forums": "forum:forum-list",
        "comments": "comment:comment-list",
        "moderation": "moderation:moderation-list",
        "game": "game:game-list",
        # ...
    }
    return Response({key: reverse(value, request=request, format=format) for key, value in endpoints.items()})

@api_view(["POST"])
@permission_classes([AllowAny])
def registration_view(request):
    """Registers a new user."""
    serializer = UserCreateSerializer(data=request.data)
    try:
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({"user": serializer.data, "message": "User registered successfully."}, status=status.HTTP_201_CREATED)
    except IntegrityError as e:
        logger.error(f"Integrity error during registration: {e}", exc_info=True)
        return Response({"error": "A user with that username already exists."}, status=status.HTTP_409_CONFLICT)
    except ValidationError as ve:
        logger.error(f"Validation error: {ve}", exc_info=True)
        return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """Authenticates a user and returns a token."""
    serializer = MyCustomTokenObtainPairSerializer(data=request.data)
    try:
        if serializer.is_valid(raise_exception=True):
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
    except ValidationError as ve:
        logger.error(f"Validation error: {ve}", exc_info=True)
        return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        logger.error(f"Unexpected error: {exc}", exc_info=True)
        response = custom_exception_handler(exc, {"view": "login_view"})
        if response is None:
            response = JsonResponse({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return response