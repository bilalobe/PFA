from rest_framework import viewsets, permissions
from rest_framework import status
from .models import User, Enrollment
from .serializers import (
    UserSerializer, 
    UserDetailSerializer, 
    UserCreateSerializer, 
    UserUpdateSerializer,
    EnrollmentSerializer
)
from .permissions import IsOwnProfileOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing users.
    Provides actions for listing, retrieving, creating, updating, and deleting users.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        """
        Returns the appropriate serializer based on the action.
        """
        if self.action == 'list':
            return UserSerializer
        elif self.action == 'retrieve':
            return UserDetailSerializer
        elif self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        """
        For list action, return only basic user data.
        """
        if self.action == 'list':
            return User.objects.all().values('id', 'username', 'email', 'user_type')
        return super().get_queryset()

    def get_object(self):
        """
        Allows retrieving own profile using 'me' keyword.
        """
        if self.action == 'retrieve' and self.kwargs['pk'] == 'me':
            return self.request.user
        return super().get_object()

    def get_permissions(self):
        """
        Sets permissions based on the action:
        - Allow anyone to create a user (registration).
        - Allow only the owner or admin to update or delete a user.
        - Allow authenticated users to retrieve user details.
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsOwnProfileOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'], url_path='enrollments', url_name='enrollments')
    def list_enrollments(self, request, pk=None):
        """
        Lists enrollments for a specific user.
        Only the user themselves or an admin can access this.
        """
        user = self.get_object()
        if user != request.user and not request.user.is_staff:
            raise PermissionDenied("You are not authorized to view these enrollments.")

        enrollments = Enrollment.objects.filter(student=user)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing enrollments.
    """
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Returns a queryset that only includes the logged-in user's enrollments.
        """
        return self.queryset.filter(student=self.request.user)

    def perform_create(self, serializer):
        """
        Handles the creation of an enrollment, checking for existing enrollments.
        """
        course = serializer.validated_data['course']

        # Check if the user is already enrolled in the course
        if Enrollment.objects.filter(student=self.request.user, course=course).exists():
            return Response(
                {"detail": "You are already enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save(student=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """
        Handles the deletion of an enrollment, checking authorization.
        """
        instance = self.get_object()

        # Check if the user is the student of the enrollment
        if instance.student != request.user:
            return Response(
                {"detail": "You are not authorized to unenroll from this course."},
                status=status.HTTP_403_FORBIDDEN
            )

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)