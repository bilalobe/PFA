from rest_framework import viewsets
from .serializers import ResourceSerializer
from .models import Resource
from rest_framework.parsers import MultiPartParser, FormParser

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    parser_classes = (MultiPartParser, FormParser) # Allow file uploads