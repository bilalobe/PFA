from django.urls import path
from .views import UtilisateurViewSet, UtilisateurDetailViewSet

urlpatterns = [
    path('utilisateurs/', UtilisateurViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('utilisateurs/<int:pk>/', UtilisateurDetailViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
]