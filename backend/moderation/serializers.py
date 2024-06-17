from rest_framework import serializers
from .models import Moderation


class ModerationSerializer(serializers.ModelSerializer):
    reported_by = serializers.CharField(source="reported_by.username", read_only=True)
    moderator = serializers.CharField(source="moderator.username", read_only=True)

    class Meta:
        model = Moderation
        fields = "__all__"
