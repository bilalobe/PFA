from django.urls import path
from .views import CoursViewSet, CoursDetailViewSet

urlpatterns = [
    path('cours/', CoursViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('cours/<int:pk>/', CoursDetailViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
]