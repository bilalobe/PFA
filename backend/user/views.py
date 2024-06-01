from rest_framework import viewsets, permissions
from .models import User
from .serializers import UserSerializer, UserDetailSerializer, UserCreateSerializer, UserUpdateSerializer
from .permissions import IsOwnProfileOrReadOnly

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
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
        if self.action == 'list':
            return User.objects.all().values('id', 'username', 'first_name', 'last_name')
        return super().get_queryset()

    def get_object(self):
        if self.action == 'retrieve' and self.kwargs['pk'] == 'me':
            return self.request.user
        return super().get_object()

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsOwnProfileOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]



