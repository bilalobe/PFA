from django.urls import include, path
from rest_framework_nested.routers import NestedSimpleRouter
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet
from backend.quizzes.views import QuizViewSet
# Additional imports
from .views import CourseVersionViewSet, CourseAnalyticsViewSet, DynamicContentViewSet, InteractiveElementViewSet, UserCourseInteractionViewSet

# Define the router
router = DefaultRouter()
router.register(r'courses', CourseViewSet)

# Register new routes
router.register(r'course_versions', CourseVersionViewSet)
router.register(r'course_analytics', CourseAnalyticsViewSet)
router.register(r'dynamic_contents', DynamicContentViewSet)
router.register(r'interactive_elements', InteractiveElementViewSet)
router.register(r'user_course_interactions', UserCourseInteractionViewSet)

# Define the nested router for courses
courses_router = NestedSimpleRouter(router, r"courses", lookup="course")
courses_router.register(r"quizzes", QuizViewSet, basename="course-quizzes")

# Define URL patterns
urlpatterns = [
    path("", include(router.urls)),
    path("", include(courses_router.urls)),
]