from rest_framework import serializers
from .models import SentimentAnalysisResult

class SentimentAnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SentimentAnalysisResult
        fields = ('id', 'text', 'sentiment', 'polarity', 'subjectivity', 'created_at')
        read_only_fields = ('id', 'created_at')  # Prevent these fields from being modified