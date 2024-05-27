from django.urls import path
from .views import ModuleViewSet, ModuleDetailViewSet
from . import views  
  
urlpatterns = [  
    path('modules/', views.ModuleListView.as_view(), name='module-list'),
    path('modules/', ModuleViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('modules/<int:pk>/', ModuleDetailViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
]