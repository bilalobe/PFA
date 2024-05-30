from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet, AnswerChoiceViewSet, UserQuizAttemptViewSet 

router = routers.DefaultRouter()
router.register(r'quizzes', QuizViewSet)
quizzes_router = NestedSimpleRouter(router, r'quizzes', lookup='quiz')
quizzes_router.register(r'questions', QuestionViewSet, basename='quiz-questions') 

urlpatterns = [
    path('', include(router.urls)),
    path('', include(quizzes_router.urls)),
]
