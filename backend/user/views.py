from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, UserDetailSerializer, UserCreateSerializer, UserUpdateSerializer
from .permissions import IsOwnProfileOrReadOnly

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing users.
    Provides actions for listing, retrieving, creating, updating, and deleting users.
    """
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        """
        Returns the appropriate serializer class based on the action.
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
        Returns a filtered queryset for the 'list' action to only include basic user information.
        """
        if self.action == 'list':
            return User.objects.all().values('id', 'username', 'first_name', 'last_name')
        return super().get_queryset()

    def get_object(self):
        """
        Allows users to retrieve their own profile using the 'me' keyword.
        """
        if self.action == 'retrieve' and self.kwargs['pk'] == 'me':
            return self.request.user
        return super().get_object()

    def get_permissions(self):
        """
        Sets specific permissions based on the action.
        - Anyone can create a user.
        - Only authenticated users can retrieve user data.
        - Only the owner can update or delete their profile.
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsOwnProfileOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['put'], url_path='update-language', permission_classes=[permissions.IsAuthenticated])
    def update_language(self, request):
        """
        Updates the user's preferred language.
        """
        language = request.data.get('language')
        if not language:
            return Response({"detail": "Language is required."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.preferred_language = language
        request.user.save()
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
