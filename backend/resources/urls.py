from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter
from .views import ResourceViewSet

router = DefaultRouter()
router.register(r'resources', ResourceViewSet, basename='resource')

# Nested router for resources within a module
modules_router = NestedSimpleRouter(router, r'modules', lookup='module')
modules_router.register(r'resources', ResourceViewSet, basename='module-resources')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(modules_router.urls)),  # Include nested routes
]