from django.urls import path, include  
from rest_framework.routers import DefaultRouter  
from .views import QuestionViewSet, AnswerChoiceViewSet, UserQuizAttemptViewSet, DetailedUserPerformanceViewSet  
  
router = DefaultRouter()  
router.register(r'questions', QuestionViewSet)  
router.register(r'choices', AnswerChoiceViewSet)  
router.register(r'attempts', UserQuizAttemptViewSet)  
router.register(r'performances', DetailedUserPerformanceViewSet)  
  
urlpatterns = [  
    path('', include(router.urls)),  
]  