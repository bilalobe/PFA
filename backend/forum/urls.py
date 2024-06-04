from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ForumViewSet, ThreadViewSet, PostViewSet, ModerationViewSet, take_action, moderate_post, report_post, moderation_dashboard

router = DefaultRouter()
router.register(r'forums', ForumViewSet)
router.register(r'threads', ThreadViewSet)
router.register(r'posts', PostViewSet)
router.register(r'moderation', ModerationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('moderate/', moderation_dashboard, name='moderation-dashboard'),
    path('moderate/post/', moderate_post, name='moderate-post'),
    path('moderate/report/', report_post, name='report-post'),
    path('take-action/', take_action, name='take-action'),
]