from .models import Module
from .serializers import ModuleSerializer, ModuleDetailSerializer
from rest_framework import viewsets

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

class ModuleDetailViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleDetailSerializer

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)