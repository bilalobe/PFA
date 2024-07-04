from rest_framework import serializers
from .models import (
    UserForumPoints,
    Badge,
    UserBadge,
    UserLevel,
    UserChallenge,
    Challenge,
    Quest,
    UserQuest,
    UserAchievement,
)


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


class UserLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLevel
        fields = "__all__"


class UserChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserChallenge
        fields = "__all__"


class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = "__all__"


class QuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quest
        fields = "__all__"


class UserQuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuest
        fields = "__all__"


class UserAchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAchievement
        fields = "__all__"
