from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = (
            "id",
            "titre",
            "description",
            "niveau_difficulte",
            "formateur",
            "date_creation",
            "image",
        )


