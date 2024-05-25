from .models import Cours
from .serializers import CoursSerializer, CoursDetailSerializer
from rest_framework import viewsets

class CoursViewSet(viewsets.ModelViewSet):
    queryset = Cours.objects.all()
    serializer_class = CoursSerializer

class CoursDetailViewSet(viewsets.ModelViewSet):
    queryset = Cours.objects.all()
    serializer_class = CoursDetailSerializer