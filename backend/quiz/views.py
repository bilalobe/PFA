from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Quiz, QuizQuestion, QuizAnswerChoice
from .serializers import QuizSerializer, QuizQuestionSerializer, QuizAnswerChoiceSerializer

class QuizViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing quizzes.
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsTeacherOrReadOnly]

    def perform_create(self, serializer):
        """
        Associates the new quiz with the specified course and sets the created_by field.
        Handles potential errors if the course does not exist.
        """
        course_id = self.kwargs.get('course_pk')
        course = get_object_or_404(Course, pk=course_id) 
        serializer.save(course=course, created_by=self.request.user) 

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """
        Retrieves a list of questions associated with the specified quiz.
        """
        quiz = self.get_object()
        questions = quiz.questions.all()
        serializer = QuizQuestionSerializer(questions, many=True)
        return Response(serializer.data)

class QuizQuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing questions within a quiz.
    """
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsTeacherOrReadOnly]

    def perform_create(self, serializer):
        """
        Associates the new question with the specified quiz and sets the created_by field.
        Handles potential errors if the quiz does not exist.
        """
        quiz_id = self.kwargs.get('quiz_pk') 
        quiz = get_object_or_404(Quiz, pk=quiz_id)
        serializer.save(quiz=quiz, created_by=self.request.user)

    @action(detail=True, methods=['get'], url_path='choices', url_name='choices')
    def choices(self, request, pk=None):
        question = self.get_object()
        serializer = QuizAnswerChoiceSerializer(question.choices.all(), many=True)
        return Response(serializer.data)

class QuizAnswerChoiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing answer choices within a question.
    """
    queryset = QuizAnswerChoice.objects.all()
    serializer_class = QuizAnswerChoiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsTeacherOrReadOnly]

    def perform_create(self, serializer):
        """
        Associates the new answer choice with the specified question and sets the created_by field.
        Handles potential errors if the question does not exist.
        """
        question_id = self.kwargs.get('question_pk') 
        question = get_object_or_404(QuizQuestion, pk=question_id)
        serializer.save(question=question, created_by=self.request.user)

