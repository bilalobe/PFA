from django.urls import path, include
from rest_framework_nested.routers import NestedSimpleRouter 
from .views import ResourceViewSet

router = DefaultRouter()  # You'll likely import this from your main urls.py
# ... (Register other viewsets if needed, e.g., CourseViewSet)

module_router = NestedSimpleRouter(router, r'modules', lookup='module')
module_router.register(r'resources', ResourceViewSet, basename='module-resources')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(module_router.urls)),
]