# utilisateur/serializers.py
from rest_framework import serializers
from .models import Utilisateur

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = '__all__'  # Ou listez les champs que vous voulez exposer