from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'course', 'rating', 'comment', 'created_at')