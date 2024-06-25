from backend.courses.permissions import IsTeacherOrReadOnly
from .utils import award_points, award_badge
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import UserForumPoints, Badge, UserBadge
from backend.users.models import User
from .serializers import UserForumPointsSerializer, BadgeSerializer, UserBadgeSerializer
from django.db import IntegrityError
from django.db.models import F, Sum

class UserForumPointsViewSet(viewsets.ModelViewSet):
    queryset = UserForumPoints.objects.all()
    serializer_class = UserForumPointsSerializer


class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]


class UserBadgeViewSet(viewsets.ModelViewSet):
    queryset = UserBadge.objects.all()
    serializer_class = UserBadgeSerializer


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_user_points_and_badges(request, user_id):
    """
    Retrieve the total points and badges for a specific user.

    Args:
        request (HttpRequest): The HTTP request object.
        user_id (int): The ID of the user.

    Returns:
        Response: The HTTP response object containing the total points and badges for the user.
    """
    # Retrieve the user object
    user = get_object_or_404(User, pk=user_id)
    
    # Aggregate total points
    total_points = UserForumPoints.objects.filter(user=user).aggregate(Sum('points'))['points__sum'] or 0
    
    # Count total badges
    total_badges = UserBadge.objects.filter(user=user).count()
    
    # Prepare the response data
    data = {
        "total_points": total_points,
        "total_badges": total_badges
    }
    
    # Return the response
    return Response(data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsTeacherOrReadOnly])
def award_user_points(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    points = request.data.get("points", 0)

    try:
        points = int(points)
        if points <= 0:
            raise ValueError("Points must be a positive integer.")
        award_points(user, points)  # Use the utility function here
        return Response({"message": "Points awarded successfully."}, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsTeacherOrReadOnly])
def award_user_badge(request, user_id, badge_name):
    user = get_object_or_404(User, pk=user_id)
    badge = get_object_or_404(Badge, name=badge_name)

    try:
        award_badge(user, badge)
        return Response({"message": "Badge awarded successfully."}, status=status.HTTP_200_OK)
    except IntegrityError:
        return Response({"error": "This badge has already been awarded to the user."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
