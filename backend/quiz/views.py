from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.course.models import Course
from .models import Quiz, QuizQuestion, QuizAnswerChoice, UserQuizAttempt
from .serializers import (
    QuizSerializer, 
    QuizQuestionSerializer, 
    QuizAnswerChoiceSerializer,
    UserQuizAttemptSerializer,
    UserQuizAttemptCreateSerializer,
    UserQuizAttemptUpdateSerializer
)
from .permissions import IsTeacherOrReadOnly
from django.utils import timezone

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
        serializer = QuizQuestionSerializer(questions, many=True, context={'request': request})
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
        """
        quiz_id = self.kwargs.get('quiz_pk')
        quiz = get_object_or_404(Quiz, pk=quiz_id)
        serializer.save(quiz=quiz, created_by=self.request.user)

    @action(detail=True, methods=['get'], url_path='choices', url_name='choices')
    def choices(self, request, pk=None):
        """
        Retrieves a list of answer choices associated with the specified question.
        """
        question = self.get_object()
        choices = question.choices.all()
        serializer = QuizAnswerChoiceSerializer(choices, many=True, context={'request': request})
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
        """
        question_id = self.kwargs.get('question_pk')
        question = get_object_or_404(QuizQuestion, pk=question_id)
        serializer.save(question=question, created_by=self.request.user)

class UserQuizAttemptViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing user quiz attempts.
    """
    queryset = UserQuizAttempt.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """
        Uses different serializers for creating and updating attempts.
        """
        if self.action == 'create':
            return UserQuizAttemptCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserQuizAttemptUpdateSerializer
        return UserQuizAttemptSerializer

    def perform_create(self, serializer):
        """
        Automatically sets the user for the attempt.
        """
        serializer.save(user=self.request.user)

    def get_queryset(self):
        """
        Ensures users can only see their own attempts, unless they are staff.
        """
        if self.request.user.is_staff:
            return UserQuizAttempt.objects.all()  # Staff can see all attempts
        return UserQuizAttempt.objects.filter(user=self.request.user)  

    def update(self, request, *args, **kwargs):
        """
        Handles quiz submission and score calculation.
        Prevents updates if the attempt is already completed.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Prevent updating a completed attempt
        if instance.completed:
            return Response({'detail': 'This quiz attempt has already been completed.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)