from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResourceListViewSet, UploadResourceViewSet

router = DefaultRouter()
router.register(r'resources', ResourceListViewSet)
router.register(r'upload', UploadResourceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
