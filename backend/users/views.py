from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from django.contrib.auth.models import AnonymousUser
from backend.courses.serializers import CourseSerializer
from backend.enrollments.models import Enrollment
from backend.enrollments.serializers import EnrollmentSerializer
from .models import User
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


class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for handling user-related operations.

    This viewset provides the following actions:
    - list: Get a list of users
    - retrieve: Get details of a specific user
    - create: Create a new user
    - update: Update an existing user
    - partial_update: Partially update an existing user
    - destroy: Delete an existing user
    - list_enrollments: Get a list of enrollments for a user
    - list_courses: Get a list of courses for a user

    The permissions for each action are determined based on the user's role and the action being performed.
    """

    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        """
        Return the serializer class based on the action being performed.

        Returns:
            The appropriate serializer class based on the action.
        """
        if self.action == "list":
            return UserSerializer
        elif self.action == "retrieve":
            return UserDetailSerializer
        elif self.action == "create":
            return UserCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        """
        Return the queryset based on the action being performed.

        Returns:
            The appropriate queryset based on the action.
        """
        if self.action == "list":
            return User.objects.all().values("id", "username", "email", "user_type")
        return super().get_queryset()

    def get_object(self):
        """
        Return the user object based on the action being performed.

        Returns:
            The user object.
        """
        if self.action == "retrieve" and self.kwargs["pk"] == "me":
            return self.request.user
        return super().get_object()

    def get_permissions(self):
        """
        Return the permissions based on the action being performed.

        Returns:
            A list of permission classes.
        """
        if self.action == "create":
            permission_classes = [permissions.AllowAny]
        elif self.action in ["update", "partial_update", "destroy"]:
            permission_classes = [permissions.IsAuthenticated, IsOwnProfileOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


@action(detail=True, methods=["get"], url_path="enrollments", url_name="enrollments")
def list_enrollments(self, request, pk=None):
    """
    Get a list of enrollments for a user.

    Args:
        request: The request object.
        pk: The primary key of the user.

    Returns:
        A response containing the serialized enrollments.
    """
    user = self.get_object()
    if user != request.user and not request.user.is_staff:
        raise PermissionDenied("You are not authorized to view these enrollments.")

    enrollments = Enrollment.objects.filter(student=user)
    if not enrollments:
        raise NotFound("No enrollments found for this user.")
    serializer = EnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)


@action(detail=True, methods=["get"], url_path="courses", url_name="courses")
def list_courses(self, request, pk=None):
    """
    Get a list of courses for a user.

    Args:
        request: The request object.
        pk: The primary key of the user.

    Returns:
        A response containing the serialized courses.
    """
    if pk and pk != "me":
        user = get_object_or_404(User, pk=pk)
    else:
        user = request.user

    if isinstance(user, AnonymousUser):
        raise PermissionDenied("You must be logged in to view courses.")

    if hasattr(user, "courses"):
        courses = user.courses.all()
        if not courses:
            raise NotFound("No courses found for this user.")
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)
    else:
        raise NotFound("No courses found for this user.")
