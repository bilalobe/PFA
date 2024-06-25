from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.courses.models import Course
from backend.quizzes.utils import auto_grade_quiz_attempt
from .models import Quiz, QuizQuestion, QuizAnswerChoice, UserQuizAttempt
from .serializers import (
    QuizSerializer, QuizQuestionSerializer, QuizAnswerChoiceSerializer,
    UserQuizAttemptSerializer, UserQuizAttemptCreateSerializer, UserQuizAttemptUpdateSerializer,
)
from .permissions import IsTeacherOrReadOnly

User = get_user_model()

class BaseViewSet(viewsets.ModelViewSet):
    """
    Base viewset that defines common behavior for all viewsets.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsTeacherOrReadOnly]

    def perform_create_with_user(self, serializer, model, lookup_field):
        """
        Generic method to associate the new object with the current user and a parent object.
        """
        lookup_id = self.kwargs.get(lookup_field)
        parent_obj = get_object_or_404(model, pk=lookup_id)
        serializer.save(created_by=self.request.user, **{lookup_field[:-3]: parent_obj})

class QuizViewSet(BaseViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def perform_create(self, serializer):
        self.perform_create_with_user(serializer, Course, "course_pk")

    @action(detail=True, methods=["get"])
    def questions(self, request, pk=None):
        quiz = self.get_object()
        questions = quiz.questions.all()
        serializer = QuizQuestionSerializer(questions, many=True, context={"request": request})
        return Response(serializer.data)

class QuizQuestionViewSet(BaseViewSet):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer

    def perform_create(self, serializer):
        self.perform_create_with_user(serializer, Quiz, "quiz_pk")

    @action(detail=True, methods=["get"], url_path="choices", url_name="choices")
    def choices(self, request, pk=None):
        question = self.get_object()
        choices = question.choices.all()
        serializer = QuizAnswerChoiceSerializer(choices, many=True, context={"request": request})
        return Response(serializer.data)

class QuizAnswerChoiceViewSet(BaseViewSet):
    queryset = QuizAnswerChoice.objects.all()
    serializer_class = QuizAnswerChoiceSerializer

    def perform_create(self, serializer):
        self.perform_create_with_user(serializer, QuizQuestion, "question_pk")

class UserQuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = UserQuizAttempt.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return UserQuizAttemptCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return UserQuizAttemptUpdateSerializer
        return UserQuizAttemptSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        # Use getattr to safely access is_staff with a default of False
        if getattr(self.request.user, 'is_staff', False):
            return UserQuizAttempt.objects.all()
        return UserQuizAttempt.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.completed:
            return Response({"detail": "This quiz attempt has already been completed."}, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)

    def update_attempt(self, request, pk, **kwargs):
        # Use get_object_or_404 directly from django.shortcuts
        instance = get_object_or_404(UserQuizAttempt, pk=pk)
        if instance.completed:
            return Response({"detail": "This quiz attempt has already been completed."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get("partial", False))
        serializer.is_valid(raise_exception=True)
        serializer.save()
        auto_grade_quiz_attempt(instance.id)
        return Response(serializer.data)