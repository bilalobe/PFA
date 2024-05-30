# utilisateur/views.py
from .models import Utilisateur
from .serializers import UtilisateurSerializer, UtilisateurDetailSerializer
from rest_framework import viewsets
from rest_framework import permissions


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated] # Only authenticated users can access/edit

    def get_object(self): 
        # Make sure users can only access their own profiles
        return self.request.user 

class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurSerializer

class UtilisateurDetailViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurDetailSerializer

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'teacher'

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'student'

class IsSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'supervisor'
