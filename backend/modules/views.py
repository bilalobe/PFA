from django.contrib.auth import get_user_model
from django.db.models import Prefetch
from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from .models import Module
from .serializers import ModuleSerializer, ModuleDetailSerializer

User = get_user_model()


class ModuleViewSet(viewsets.ModelViewSet):
    serializer_class = ModuleSerializer
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        user = self.request.user
        # Check for 'is_superuser' attribute safely
        if getattr(user, 'is_superuser', False):
            return Module.objects.all().prefetch_related(Prefetch('course'))
        # Refactor to comply with line length requirements
        return (
            Module.objects
            .filter(course__instructor=user)
            .select_related('course')[:80]
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        # Consider adding logging here

    def get_serializer_class(self):
        if self.action == 'list':
            # Corrected to ModuleDetailSerializer
            return ModuleDetailSerializer
        return super().get_serializer_class()
