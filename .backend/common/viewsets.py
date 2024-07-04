from rest_framework import viewsets

from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from backend.courses.permissions import IsTeacherOrReadOnly

class BaseViewSet(viewsets.ModelViewSet):
    """
    A base viewset to apply common configurations.
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsTeacherOrReadOnly]
        return [permission() for permission in permission_classes]