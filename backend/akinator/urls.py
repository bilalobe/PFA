# ai/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SentimentAnalysisViewSet, recommend_learning_path

router = DefaultRouter()
router.register(r'sentiment', SentimentAnalysisViewSet, basename='sentiment')

urlpatterns = [
    path('', include(router.urls)),
    path('recommendations/', recommend_learning_path, name='recommend-learning-path'),
]
