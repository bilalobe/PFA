from rest_framework import serializers
from ..cours.models import Cours

class CoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cours
        fields = '__all__'