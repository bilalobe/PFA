from django.db import models
from django.contrib.auth import get_user_model
from backend.common.firestore_mixins import FirestoreDocumentMixin
from backend.common.firebase_admin_init import db as firestore_client
from common.firestore_mixins import FirestoreDocumentMixin
from google.cloud import firestore

User = get_user_model()

class Quiz(FirestoreDocumentMixin, models.Model):
    """
    Represents a quiz in the system.

    Attributes:
        id (AutoField): The primary key of the quiz.
        course (ForeignKey): The course to which the quiz belongs.
        title (CharField): The title of the quiz.
        description (TextField): The description of the quiz.
        created_by (ForeignKey): The user who created the quiz.
        created_at (DateTimeField): The timestamp when the quiz was created.
    """

    id = models.AutoField(primary_key=True)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name="quizzes")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="quizzes_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def to_firestore_doc(self):
        return {
            "course_id": self.course.id,
            "title": self.title,
            "description": self.description,
            "created_by_id": self.created_by.pk,
            "created_at": self.created_at.isoformat(),
        }


class QuizQuestion(FirestoreDocumentMixin, models.Model):
    """
    Represents a question in a quiz.

    Attributes:
        id (AutoField): The primary key for the question.
        quiz (ForeignKey): The foreign key to the Quiz model, representing the quiz that the question belongs to.
        text (TextField): The text of the question.
        short_answer (CharField): The short answer for the question (optional).
        question_type (CharField): The type of the question, chosen from a set of predefined choices.
        order (PositiveIntegerField): The order of the question within the quiz.
        created_by (ForeignKey): The foreign key to the User model, representing the user who created the question.
        created_at (DateTimeField): The timestamp of when the question was created.

    Methods:
        __str__: Returns a string representation of the question.
        save: Overrides the save method to save the question in a transaction to Firestore.
        delete: Overrides the delete method to delete the question in a transaction from Firestore.
        to_firestore_doc: Converts the question to a dictionary representation for Firestore.

    """

    id = models.AutoField(primary_key=True)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    short_answer = models.CharField(max_length=255, blank=True, null=True)
    question_type = models.CharField(
        max_length=20,
        choices=(
            ("multiple_choice", "Multiple Choice"),
            ("true_false", "True/False"),
            ("short_answer", "Short Answer"),
        ),
        default="multiple_choice",
    )
    order = models.PositiveIntegerField()
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="questions_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """
        Returns a string representation of the question.

        Returns:
            str: The text of the question.
        """
        return self.text

    firestore_client = firestore.Client()

    def save(self, *args, **kwargs):
        """
        Overrides the save method to save the question in a transaction to Firestore.
        """
        transaction = firestore_client.transaction()
    
        @firestore.transactional
        def save_in_transaction(transaction, quiz_question):
            super().save(*args, **kwargs)
            doc_ref = firestore_client.collection('quizzes').document(str(quiz_question.id))
            transaction.set(doc_ref, quiz_question.to_firestore_doc())
    
        save_in_transaction(transaction, self)

    def delete(self, *args, **kwargs):
        """
        Overrides the delete method to delete the question in a transaction from Firestore.
        """
        transaction = firestore_client.transaction()
    
        @firestore.transactional
        def delete_in_transaction(transaction, quiz_question):
            doc_ref = firestore_client.collection('quizzes').document(str(quiz_question.id))
            transaction.delete(doc_ref)
            super().delete(*args, **kwargs)
    
        delete_in_transaction(transaction, self)

    def to_firestore_doc(self):
        """
        Converts the question to a dictionary representation for Firestore.

        Returns:
            dict: A dictionary representation of the question.
        """
        return {
            "quiz_id": self.quiz.id,
            "text": self.text,
            "short_answer": self.short_answer,
            "question_type": self.question_type,
            "order": self.order,
            "created_by_id": self.created_by.pk,
            "created_at": self.created_at.isoformat(),
        }


class QuizAnswerChoice(FirestoreDocumentMixin, models.Model):
    """
    Represents an answer choice for a quiz question.

    Attributes:
        question (ForeignKey): The foreign key to the QuizQuestion model.
        text (CharField): The text of the answer choice.
        is_correct (BooleanField): Indicates whether the answer choice is correct or not.
        order (PositiveIntegerField): The order of the answer choice.
        created_at (DateTimeField): The timestamp when the answer choice was created.
    """

    question = models.ForeignKey(
        'quizzes.QuizQuestion', on_delete=models.CASCADE, related_name="choices"
    )
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text

    def to_firestore_doc(self):
        return {
            "question_id": self.question.id,
            "text": self.text,
            "is_correct": self.is_correct,
            "order": self.order,
            "created_at": self.created_at.isoformat(),
        }


class UserQuizAttempt(models.Model):
    """
    Represents a user's attempt at a quiz.

    Attributes:
        user (User): The user who attempted the quiz.
        quiz (Quiz): The quiz that was attempted.
        answered_questions (int): The number of questions answered in the attempt.
        correct_answers (int): The number of correct answers in the attempt.
        score (int): The score achieved in the attempt.
        answers (ManyToManyField): The answers provided by the user for each question.
        start_time (datetime): The start time of the attempt.
        end_time (datetime): The end time of the attempt.
        progress (int): The progress of the attempt (in percentage).
        completed (bool): Indicates whether the attempt is completed or not.
    """
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="quiz_attempts"
    )
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    answered_questions = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    score = models.PositiveIntegerField(default=0)
    answers = models.ManyToManyField(
        QuizQuestion, through="UserQuizAnswer", related_name="user_attempts"
    )
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    progress = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user} - {self.quiz.title} - Score: {self.score}"