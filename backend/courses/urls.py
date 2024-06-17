from django.urls import include, path
from rest_framework import routers
from rest_framework_nested.routers import NestedSimpleRouter

from backend.enrollment.views import EnrollmentViewSet
from .views import CourseViewSet, QuizViewSet, ModuleViewSet, list_enrollments

# Create a router and register our viewsets with it.
router = routers.DefaultRouter()
router.register(r"courses", CourseViewSet)

# Initialize the nested router for modules under `courses` (using 'course' for lookup)
courses_router = NestedSimpleRouter(router, r"courses", lookup="course")
courses_router.register(r"modules", ModuleViewSet, basename="course-modules")
courses_router.register(r"quizzes", QuizViewSet, basename="course-quizzes")
courses_router.register(
    r"enrollments", EnrollmentViewSet, basename="course-enrollments"
)

# Initialize the nested router for quizzes under `modules` (using 'module' for lookup)
modules_router = NestedSimpleRouter(router, r"modules", lookup="module")
modules_router.register(r"quizzes", QuizViewSet, basename="module-quizzes")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(courses_router.urls)),
    path("", include(modules_router.urls)),
    path("enrollments/", list_enrollments, name="list_enrollments"),
]
