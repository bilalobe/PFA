from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserForumPointsViewSet, BadgeViewSet, UserBadgeViewSet, award_user_points, award_user_badge 

router = DefaultRouter()
router.register(r'user_forum_points', UserForumPointsViewSet, basename='user-forum-points')
router.register(r'badges', BadgeViewSet, basename='badge') 
router.register(r'user_badges', UserBadgeViewSet, basename='user-badge') 

urlpatterns = [
    path('', include(router.urls)), 
    path('users/<int:user_id>/points/', award_user_points, name='award_user_points'),
    path('users/<int:user_id>/badges/<str:badge_name>/', award_user_badge, name='award_user_badge'),
]