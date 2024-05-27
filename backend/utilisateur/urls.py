from django.urls import path
from . import views
from .views import UtilisateurViewSet, UtilisateurDetailViewSet
  
urlpatterns = [  
    path('modules/', views.ModuleListView.as_view(), name='module-list'),  
    path('profile/', views.profile, name='profile'),  
    path('utilisateurs/', UtilisateurViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('utilisateurs/<int:pk>/', UtilisateurDetailViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
]