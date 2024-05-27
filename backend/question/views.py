from rest_framework import viewsets
from .models import Quiz, Question, AnswerChoice, UserQuizAttempt, DetailedUserPerformance
from .serializers import QuizSerializer, QuestionSerializer, AnswerChoiceSerializer, UserQuizAttemptSerializer, DetailedUserPerformanceSerializer

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class AnswerChoiceViewSet(viewsets.ModelViewSet):
    queryset = AnswerChoice.objects.all()
    serializer_class = AnswerChoiceSerializer

class UserQuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = UserQuizAttempt.objects.all()
    serializer_class = UserQuizAttemptSerializer

class DetailedUserPerformanceViewSet(viewsets.ModelViewSet):
    queryset = DetailedUserPerformance.objects.all()
    serializer_class = DetailedUserPerformanceSerializer
