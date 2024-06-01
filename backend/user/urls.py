from django.urls import path, include
from rest_framework.routers import DefaultRouter
from user.views import UserViewSet,  UserProfileViewSet
from module.views import ModuleViewSet, ModuleDetailViewSet

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'modules', ModuleViewSet)
router.register(r'module-details', ModuleDetailViewSet, basename='module-detail')

urlpatterns = [
    path('api/', include(router.urls)),  # URLs for ViewSets
    path('api-auth/', include('rest_framework.urls')),  # URLs for authentication
    path('api/user/', UserViewSet.as_view(), name='user'),
]
