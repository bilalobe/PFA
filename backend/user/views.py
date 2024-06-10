from rest_framework import viewsets, permissions
from .models import User, Enrollment
from .serializers import (
    UserSerializer, 
    UserDetailSerializer, 
    UserCreateSerializer, 
    UserUpdateSerializer,
)
from .permissions import IsOwnProfileOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing users.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  

    def get_serializer_class(self):
        """
        Returns the appropriate serializer based on the action being performed.
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
            return User.objects.all().values('id', 'username')
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
        List enrollments for a specific user.
        Only the user themselves or an admin can access this.
        """
        user = self.get_object()
        if user != request.user and not request.user.is_staff:
            raise PermissionDenied("You are not authorized to view these enrollments.")

        enrollments = Enrollment.objects.filter(student=user)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)