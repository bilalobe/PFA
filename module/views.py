from .models import Module
from .serializers import ModuleSerializer, ModuleDetailSerializer
from rest_framework import viewsets

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

class ModuleDetailViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleDetailSerializer