from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.posts.views import PostViewSet

# Initialize the default router
router = DefaultRouter()

# Register the PostViewSet with the router
router.register(r'posts', PostViewSet, basename='post')

# Define the URL patterns for the posts app
urlpatterns = [
    path('', include(router.urls)),
]