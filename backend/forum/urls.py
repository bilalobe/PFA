from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ForumPostViewSet, CommentViewSet

router = DefaultRouter()
router.register(r'forum-posts', ForumPostViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
