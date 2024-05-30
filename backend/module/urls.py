from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ModuleViewSet, ModuleDetailViewSet, profile  # Import your views

router = DefaultRouter()
router.register(r'modules', ModuleViewSet)
router.register(r'module-details', ModuleDetailViewSet, basename='module-detail')  # basename for detail view

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', profile, name='profile'),  # Assuming 'profile' is a function-based view
]