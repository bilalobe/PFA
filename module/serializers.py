from rest_framework import serializers
from .models import Module

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ('id', 'titre', 'contenu', 'cours', 'ordre', 'type', 'duree_estimee')

class ModuleDetailSerializer( serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ('id', 'titre', 'contenu', 'cours', 'ordre', 'type', 'duree_estimee', 'quizzes', 'exercices')