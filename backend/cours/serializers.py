from rest_framework import serializers
from .models import Cours


class CoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cours
        fields = (
            "id",
            "titre",
            "description",
            "niveau_difficulte",
            "formateur",
            "date_creation",
            "image",
        )


