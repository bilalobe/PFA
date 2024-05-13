# utilisateur/views.py
from .models import Utilisateur
from .serializers import UtilisateurSerializer, UtilisateurDetailSerializer
from rest_framework import viewsets

class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurSerializer

class UtilisateurDetailViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurDetailSerializer