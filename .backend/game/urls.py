from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'userlevels', views.UserLevelViewSet)
router.register(r'userforumpoints', views.UserForumPointsViewSet)
router.register(r'badges', views.BadgeViewSet)
router.register(r'userbadges', views.UserBadgeViewSet)
router.register(r'challenges', views.ChallengeViewSet)
router.register(r'userchallenges', views.UserChallengeViewSet)
router.register(r'quests', views.QuestViewSet)
router.register(r'userquests', views.UserQuestViewSet)
router.register(r'userachievements', views.UserAchievementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]