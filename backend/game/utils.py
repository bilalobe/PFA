from .models import UserForumPoints, Badge, UserBadge
from django.contrib.auth.models import User


def award_points(user, points):
    """
    Awards points to a user.
    """
    user_points, created = UserForumPoints.objects.get_or_create(user=user)
    user_points.points += points
    user_points.save()


def award_badge(user, badge):
    """
    Awards a badge to a user.
    """
    UserBadge.objects.get_or_create(user=user, badge=badge)
