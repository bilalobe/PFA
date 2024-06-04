from rest_framework import serializers
from quiz.models import Quiz  

class QuizRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ('id', 'title', 'course')  # Fields you want to include in recommendations