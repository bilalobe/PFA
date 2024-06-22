from django.urls import include, path
from rest_framework_nested.routers import NestedSimpleRouter
from rest_framework.routers import DefaultRouter

# Corrected import paths
from .views import CourseViewSet, ModuleViewSet, DynamicContentViewSet, CourseQuizViewSet, CourseAnalyticsViewSet
from backend.quizzes.views import QuizViewSet

# Define the router
router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'dynamic-content', DynamicContentViewSet)
router.register(r'course-quizzes', CourseQuizViewSet)
router.register(r'course-analytics', CourseAnalyticsViewSet)

courses_router = NestedSimpleRouter(router, r"courses", lookup="course")
courses_router.register(r"modules", ModuleViewSet, basename="course-modules")
courses_router.register(r"quizzes", QuizViewSet, basename="course-quizzes")

modules_router = NestedSimpleRouter(router, r"modules", lookup="module")
modules_router.register(r"quizzes", QuizViewSet, basename="module-quizzes")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(courses_router.urls)),
    path("", include(modules_router.urls)),
]
