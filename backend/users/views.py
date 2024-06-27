from django.contrib.auth.models import AnonymousUser
from rest_framework import viewsets, permissions, status
from .serializers import (
    UserSerializer,
    UserDetailSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
)
from .permissions import IsOwnProfileOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from firebase_admin import firestore, storage
from backend.common.firebase_admin_init import firebase_auth

db = firestore.client()
bucket = storage.bucket()

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == "list":
            return UserSerializer
        elif self.action == "retrieve":
            return UserDetailSerializer
        elif self.action == "create":
            return UserCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user_data = serializer.validated_data
                user = firebase_auth.create_user(
                    email=user_data['email'],
                    email_verified=False,
                    password=user_data['password'],
                    display_name=user_data.get('display_name', ''),
                    disabled=False
                )
                # Optionally, save additional user data to your Firestore database here
                return Response({"uid": user.uid, "email": user.email}, status=status.HTTP_201_CREATED)
            except Exception as e:
                # Handle specific exceptions from Firebase and return appropriate responses
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_object(self):
        if self.action == "retrieve" and self.kwargs["pk"] == "me":
            return self.request.user
        return super().get_object()

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [permissions.AllowAny]
        elif self.action in ["update", "partial_update", "destroy"]:
            permission_classes = [permissions.IsAuthenticated, IsOwnProfileOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=["get"], url_path="enrollments", url_name="enrollments")
    def list_enrollments(self, _, pk=None):
        user_ref = db.collection('users').document(pk)
        user_doc = user_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            if user_data:
                enrollments = user_data.get('enrollments', [])
                return Response(enrollments)
            else:
                raise NotFound("User data not found.")
        else:
            raise NotFound("User not found.")

    @action(detail=True, methods=["get"], url_path="courses", url_name="courses")
    def list_courses(self, request, pk=None):
        if pk and pk != "me":
            user_ref = db.collection('users').document(pk)
            user_doc = user_ref.get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                if user_data:
                    courses = user_data.get('courses', [])
                    return Response(courses)
                else:
                    raise NotFound("User data not found.")
            else:
                raise NotFound("User not found.")
        else:
            user = request.user
            if isinstance(user, AnonymousUser):
                raise PermissionDenied("You must be logged in to view courses.")
            return Response({"detail": "This method is not implemented yet."}, status=status.HTTP_501_NOT_IMPLEMENTED)