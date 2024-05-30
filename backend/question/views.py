from rest_framework import viewsets
from .models import Quiz, Question, AnswerChoice, UserQuizAttempt, DetailedUserPerformance
from .serializers import QuizSerializer, QuestionSerializer, AnswerChoiceSerializer, UserQuizAttemptSerializer, DetailedUserPerformanceSerializer

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['text'] 
    ordering_fields = ['id', 'created_at'] 

    def get_queryset(self):
        queryset = Question.objects.all()
        quiz_id = self.request.query_params.get('quiz')
        if quiz_id is not None:
            queryset = queryset.filter(quiz_id=quiz_id)
        return queryset

class AnswerChoiceViewSet(viewsets.ModelViewSet):
    queryset = AnswerChoice.objects.all()
    serializer_class = AnswerChoiceSerializer

class UserQuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = UserQuizAttempt.objects.all()
    serializer_class = UserQuizAttemptSerializer

class DetailedUserPerformanceViewSet(viewsets.ModelViewSet):
    queryset = DetailedUserPerformance.objects.all()
    serializer_class = DetailedUserPerformanceSerializer
