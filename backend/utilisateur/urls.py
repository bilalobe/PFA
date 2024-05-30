from django.urls import path, include
from rest_framework.routers import DefaultRouter
from module.views import ModuleViewSet, ModuleDetailViewSet
from .models import Profile
from .views import (
    
    UtilisateurViewSet, 
    UtilisateurDetailViewSet, 
    ModuleViewSet, 
    ModuleDetailViewSet, # Make sure to include ModuleDetailViewSet
    UserProfileViewSet, 
    profile  
) 

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'modules', ModuleViewSet)
router.register(r'module-details', ModuleDetailViewSet, basename='module-detail')

urlpatterns = [
    path('api/', include(router.urls)),  # URLs for ViewSets
    path('profile/', profile, name='profile'),  # Your function-based view
    # Add other URL patterns for function-based views here 
]