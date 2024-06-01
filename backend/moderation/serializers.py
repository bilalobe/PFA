from rest_framework import serializers
from .models import Moderation
from user.models import User 

class ModerationSerializer(serializers.ModelSerializer):
    reported_by = serializers.CharField(source='reported_by.username', read_only=True)  # Show the username of the reporter

    class Meta:
        model = Moderation
        fields = ('id', 'post', 'reason', 'reported_by', 'created_at')