from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnrollmentViewSet
from . import views 

router = DefaultRouter()
router.register(r'enrollments', EnrollmentViewSet)

urlpatterns = [
    path('enroll/', views.enroll, name='enroll'),
    path('', include(router.urls)),
]
 
  
    