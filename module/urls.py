from django.urls import path
from .views import ModuleViewSet, ModuleDetailViewSet

urlpatterns = [
    path('modules/', ModuleViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('modules/<int:pk>/', ModuleDetailViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
]