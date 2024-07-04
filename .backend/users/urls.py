from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

# Import viewsets
from .views import UserViewSet
from courses.views import CourseViewSet
from quizzes.views import QuizViewSet
from enrollments.views import EnrollmentViewSet
from modules.views import ModuleViewSet

# Main router for user-related endpoints
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

# Function to create nested routers for a parent router
def create_nested_router(parent_router, parent_prefix, lookup, viewset, basename):
    nested_router = routers.NestedSimpleRouter(parent_router, parent_prefix, lookup=lookup)
    nested_router.register(r'', viewset, basename=basename)
    return nested_router

# Creating nested routers for each entity associated with a user
courses_router = create_nested_router(router, r'users', 'user', CourseViewSet, 'user-courses')
quizzes_router = create_nested_router(router, r'users', 'user', QuizViewSet, 'user-quizzes')
enrollments_router = create_nested_router(router, r'users', 'user', EnrollmentViewSet, 'user-enrollments')
modules_router = create_nested_router(router, r'users', 'user', ModuleViewSet, 'user-modules')

# URL patterns to include the routers
urlpatterns = [
    path('', include(router.urls)),
    path('users/<int:user_pk>/', include(courses_router.urls)),
    path('users/<int:user_pk>/', include(quizzes_router.urls)),
    path('users/<int:user_pk>/', include(enrollments_router.urls)),
    path('users/<int:user_pk>/', include(modules_router.urls)),
]