from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet, AnswerChoiceViewSet, UserQuizAttemptViewSet 

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'choices', AnswerChoiceViewSet)
router.register(r'attempts', UserQuizAttemptViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
