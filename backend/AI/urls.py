from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SentimentAnalysisViewSet

router = DefaultRouter()
router.register(r'sentiment', SentimentAnalysisViewSet, basename='sentiment')

urlpatterns = [
    path('', include(router.urls)),
]