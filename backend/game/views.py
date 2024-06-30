import logging
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.response import Response

from .models import (
    UserForumPoints, Badge, UserBadge, UserLevel, UserChallenge,
    Challenge, Quest, UserQuest, UserAchievement, User
)
from .serializers import (
    UserForumPointsSerializer, BadgeSerializer, UserBadgeSerializer,
    UserLevelSerializer, UserChallengeSerializer, ChallengeSerializer,
    QuestSerializer, UserQuestSerializer, UserAchievementSerializer
)
from backend.common.viewsets import BaseViewSet

logger = logging.getLogger(__name__)

class UserForumPointsViewSet(BaseViewSet):
    """
    A viewset for viewing and editing user forum points.
    """
    queryset = UserForumPoints.objects.select_related('user').all()
    serializer_class = UserForumPointsSerializer

class BadgeViewSet(BaseViewSet):
    """
    A viewset for viewing and editing badges.
    """
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer

class UserBadgeViewSet(BaseViewSet):
    """
    A viewset for viewing and editing user badges.
    """
    queryset = UserBadge.objects.select_related('user', 'badge').all()
    serializer_class = UserBadgeSerializer

class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for retrieving leaderboard data, optimized for read-only operations.
    """
    queryset = UserForumPoints.objects.all()

    def list(self, request):
        """
        List all users and their total points, ordered by total points in descending order.
        """
        leaderboard = UserForumPoints.objects.values('user__id', 'user__username').annotate(total_points=Sum('points')).order_by('-total_points')
        return Response(list(leaderboard))

    def retrieve(self, request, pk=None):
        """
        Retrieve the total points for a specific user.
        
        Args:
            pk: The primary key of the user.
        """
        user = get_object_or_404(User, pk=pk)
        total_points = UserForumPoints.objects.filter(user=user).aggregate(total_points=Sum('points'))['total_points'] or 0
        return Response({"total_points": total_points})

class UserLevelViewSet(BaseViewSet):
    """
    A viewset for viewing and editing user levels.
    """
    queryset = UserLevel.objects.select_related('user').all()
    serializer_class = UserLevelSerializer

class UserChallengeViewSet(BaseViewSet):
    """
    A viewset for viewing and editing user challenges.
    """
    queryset = UserChallenge.objects.select_related('user', 'challenge').all()
    serializer_class = UserChallengeSerializer

class ChallengeViewSet(BaseViewSet):
    """
    A viewset for viewing and editing challenges.
    """
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer

class QuestViewSet(BaseViewSet):
    """
    A viewset for viewing and editing quests.
    """
    queryset = Quest.objects.all()
    serializer_class = QuestSerializer

class UserQuestViewSet(BaseViewSet):
    """
    A viewset for viewing and editing user quests.
    """
    queryset = UserQuest.objects.select_related('user', 'quest').all()
    serializer_class = UserQuestSerializer

class UserAchievementViewSet(BaseViewSet):
    """
    A viewset for viewing and editing user achievements.
    """
    queryset = UserAchievement.objects.select_related('user', 'achievement').all()
    serializer_class = UserAchievementSerializer
