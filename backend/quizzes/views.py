from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from google.cloud.firestore import Client, Transaction
from backend.common.firebase_admin_init import db

from backend.courses.models import Course
from backend.quizzes.utils import auto_grade_quiz_attempt
from .models import Quiz, QuizQuestion, QuizAnswerChoice
from .serializers import (
    QuizSerializer, QuizQuestionSerializer, QuizAnswerChoiceSerializer,
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

class UserQuizAttemptViewSet(viewsets.ViewSet):
    """
    A viewset for handling user quiz attempts.

    Methods:
    - list: Get a list of user quiz attempts.
    - create: Create a new user quiz attempt.
    - update: Update an existing user quiz attempt.
    """

    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """
        Get a list of user quiz attempts.

        If the user is a staff member, all quiz attempts are returned.
        Otherwise, only the quiz attempts of the authenticated user are returned.

        Returns:
        - Response: A response containing the list of quiz attempts.
        """
        user = request.user
        if user.is_staff:
            query = db.collection('UserQuizAttempts').stream()
        else:
            query = db.collection('UserQuizAttempts').where('user_id', '==', user.id).stream()
        attempts = [doc.to_dict() for doc in query]
        return Response(attempts)

    def create(self, request):
        """
        Create a new user quiz attempt.

        The user ID is added to the request data before creating the attempt.

        Returns:
        - Response: A response containing the created quiz attempt data.
        """
        data = request.data.copy()
        data['user_id'] = request.user.id

        # Start a transaction
        with db.transaction() as transaction:
            # Add the new quiz attempt data
            ref = db.collection('UserQuizAttempts').document()
            transaction.set(ref, data)

        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        """
        Update an existing user quiz attempt.

        The attempt is updated within a transaction. If the attempt is already completed,
        an error is raised. After the update, the attempt is graded.

        Args:
        - pk (str): The ID of the quiz attempt to update.

        Returns:
        - Response: A response containing the updated quiz attempt data.
        """
        def transaction_update(transaction, doc_ref):
            doc = doc_ref.get(transaction=transaction)
            if not doc.exists:
                raise ValueError(f"Document {pk} not found.")
            data = doc.to_dict()
            if data['completed']:
                raise ValueError("This quiz attempt has already been completed.")
            updated_data = request.data.copy()
            transaction.update(doc_ref, updated_data)
            return updated_data

        doc_ref = db.collection('UserQuizAttempts').document(pk)

        try:
            # Corrected transaction usage
            updated_data = db.transaction(lambda transaction: transaction_update(transaction, doc_ref)) # type: ignore
            auto_grade_quiz_attempt(pk)  # Grade the attempt
            return Response(updated_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)