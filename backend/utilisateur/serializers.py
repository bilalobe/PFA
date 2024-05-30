# utilisateur/serializers.py
from rest_framework import serializers
from .models import Utilisateur

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class UtilisateurDetailSerializer( serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'niveau_competence', 'domaine_expertise')

