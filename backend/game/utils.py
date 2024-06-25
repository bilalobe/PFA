from .models import UserForumPoints, UserBadge
from django.db import IntegrityError

def award_points(user, points):
    """
    Awards points to a user.
    Returns a tuple of (success: bool, message: str).
    """
    try:
        user_points, created = UserForumPoints.objects.get_or_create(user=user)
        user_points.points += points
        user_points.save()
        return True, "Points awarded successfully."
    except IntegrityError:
        return False, "Failed to award points due to a database error."
    except Exception as e:
        return False, str(e)

def award_badge(user, badge):
    """
    Awards a badge to a user.
    Returns a tuple of (success: bool, message: str).
    """
    try:
        UserBadge.objects.get_or_create(user=user, badge=badge)
        return True, "Badge awarded successfully."
    except IntegrityError:
        return False, "This badge has already been awarded to the user."
    except Exception as e:
        return False, str(e)