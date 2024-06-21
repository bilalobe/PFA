from .utils import award_points, award_badge
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import UserForumPoints, Badge, UserBadge
from .serializers import UserForumPointsSerializer, BadgeSerializer, UserBadgeSerializer


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


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsTeacherOrReadOnly])
def award_user_points(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    points = request.data.get("points")
    if not points:
        return Response(
            {"error": "Points value is required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        points = int(points)
        award_points(user, points)
        return Response(
            {"message": "Points awarded successfully."}, status=status.HTTP_200_OK
        )
    except ValueError:
        return Response(
            {"error": "Invalid points value."}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsTeacherOrReadOnly])
def award_user_badge(request, user_id, badge_name):
    try:
        user = User.objects.get(pk=user_id)
        badge = Badge.objects.get(name=badge_name)
    except (User.DoesNotExist, Badge.DoesNotExist):
        return Response(
            {"error": "User or Badge not found."}, status=status.HTTP_404_NOT_FOUND
        )

    try:
        award_badge(user, badge)
        return Response(
            {"message": "Badge awarded successfully."}, status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
