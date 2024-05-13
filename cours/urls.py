from django.urls import path
from .views import CoursListView, CoursDetailView

urlpatterns = [
    path('cours/', CoursListView.as_view(), name='cours-list'),
    path('cours/<int:pk>/', CoursDetailView.as_view(), name='cours-detail'),
]