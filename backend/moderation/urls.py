from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.moderation_dashboard, name='moderation-dashboard'),
    path('<int:moderation_id>/take-action/', views.take_action, name='take-action'),
    path('report/', views.report_content, name='report-content'),
]