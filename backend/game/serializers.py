from rest_framework import serializers
from .models import UserForumPoints, Badge, UserBadge


class UserForumPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserForumPoints
        fields = "__all__"


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = "__all__"


class UserBadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBadge
        fields = "__all__"
