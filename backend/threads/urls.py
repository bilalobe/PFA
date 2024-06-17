# backend/threads/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ThreadViewSet

router = DefaultRouter()
router.register(r"threads", ThreadViewSet, basename="thread")

urlpatterns = [
    path("", include(router.urls)),
]
