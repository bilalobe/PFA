from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Quiz, QuizQuestion, QuizAnswerChoice, UserQuizAttempt
from courses.models import Course, Module


class QuizModelTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword",
            user_type="teacher",
        )
        self.course = Course.objects.create(
            title="Test Course", description="Test Description", instructor=self.user
        )
        self.quiz = Quiz.objects.create(
            course=self.course,
            title="Test Quiz",
            description="Test Quiz Description",
            created_by=self.user,
        )

    def test_quiz_creation(self):
        self.assertEqual(self.quiz.title, "Test Quiz")
        self.assertEqual(self.quiz.course, self.course)

    def test_quiz_str_method(self):
        self.assertEqual(str(self.quiz), "Test Quiz")


class QuizQuestionModelTests(TestCase):
    def setUp(self):
        # ... (similar setup as above) ...
        self.question = QuizQuestion.objects.create(
            quiz=self.quiz,
            text="Test Question?",
            question_type="multiple_choice",
            order=1,
            created_by=self.user,
        )

    def test_question_creation(self):
        self.assertEqual(self.question.text, "Test Question?")
        self.assertEqual(self.question.quiz, self.quiz)

    # ... (Add more tests for QuizQuestion and other models)
