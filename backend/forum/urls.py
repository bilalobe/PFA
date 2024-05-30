from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ForumViewSet, ThreadViewSet, PostViewSet, moderation_dashboard, report_post, delete_post

router = DefaultRouter()
router.register(r'forums', ForumViewSet)
router.register(r'threads', ThreadViewSet)
router.register(r'posts', PostViewSet)
router.register(r'moderation', ModerationViewSet, basename='moderation')

urlpatterns = [
    path('', include(router.urls)),
    path('moderate/', moderation_dashboard, name='moderation-dashboard'),
    path('moderate/post/<int:post_id>/delete/', delete_post, name='delete-post'),
    path('moderate/', report_post, name='report-post'),
]