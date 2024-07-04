from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter
from .views import (
    QuizViewSet,
    QuizQuestionViewSet,
    QuizAnswerChoiceViewSet,
    UserQuizAttemptViewSet,
)

router = DefaultRouter()
router.register(r"quizzes", QuizViewSet)
router.register(r"attempts", UserQuizAttemptViewSet)  # Register attempts viewset

quizzes_router = NestedSimpleRouter(router, r"quizzes", lookup="quiz")
quizzes_router.register(r"questions", QuizQuestionViewSet, basename="quiz-questions")

questions_router = NestedSimpleRouter(quizzes_router, r"questions", lookup="question")
questions_router.register(
    r"choices", QuizAnswerChoiceViewSet, basename="question-choices"
)

urlpatterns = [
    path("", include(router.urls)),
    path("", include(quizzes_router.urls)),
    path("", include(questions_router.urls)),
]
