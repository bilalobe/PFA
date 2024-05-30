from .models import Module
from .serializers import ModuleSerializer, ModuleDetailSerializer
from rest_framework import viewsets
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

class ModuleDetailViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleDetailSerializer
    permission_classes = [IsAuthenticated]  # Authentication required for all actions

    def update(self, request, *args, **kwargs):
        instance = self.get_object()  # Get the module instance

        # Authorization check
        if instance.cours.instructor != request.user: 
            return Response({"detail": "You are not authorized to update this module."}, 
                            status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)