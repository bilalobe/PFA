from django.shortcuts import redirect


def api_root(request):
    """
    Redirects to the API documentation (Swagger UI, if you've set it up).
    """
    return redirect("/api/docs/")  # Replace with your actual API docs URL


# Path: backend/eplatform_backend/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter
from .views import (
    CourseViewSet,
    ModuleViewSet,
    ReviewViewSet,
    QuizViewSet,
    QuizQuestionViewSet,
    QuizAnswerChoiceViewSet,
    api_root,
)

router = DefaultRouter()
router.register(r"courses", CourseViewSet)
nested_router = NestedSimpleRouter(router, r"courses", lookup="course")
nested_router.register(r"modules", ModuleViewSet, basename="course-modules")
nested_router.register(r"reviews", ReviewViewSet, basename="course-reviews")

quiz_router = NestedSimpleRouter(nested_router, r"modules", lookup="module")
quiz_router.register(r"quizzes", QuizViewSet, basename="module-quizzes")

question_router = NestedSimpleRouter(quiz_router, r"quizzes", lookup="quiz")
question_router.register(r"questions", QuizQuestionViewSet, basename="quiz-questions")

choice_router = NestedSimpleRouter(question_router, r"questions", lookup="question")
choice_router.register(r"choices", QuizAnswerChoiceViewSet, basename="question-choices")

urlpatterns = [
    path("", api_root),
    path("api/", include(router.urls)),
    path("api/", include(nested_router.urls)),
    path("api/", include(quiz_router.urls)),
    path("api/", include(question_router.urls)),
    path("api/", include(choice_router.urls)),
]
