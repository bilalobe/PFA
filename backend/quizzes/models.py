from django.db import models
from backend.users.models import User
from courses.models import Course


class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="quizzes")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="quizzes_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    short_answer = models.CharField(max_length=255, blank=True, null=True)
    question_type = models.CharField(
        max_length=20,
        choices=(
            ("multiple_choice", "Multiple Choice"),
            ("true_false", "True/False"),
            # ... other question types
        ),
        default="multiple_choice",
    )
    order = models.PositiveIntegerField()
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="questions_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text


class QuizAnswerChoice(models.Model):
    question = models.ForeignKey(
        QuizQuestion, on_delete=models.CASCADE, related_name="choices"
    )
    id = models.AutoField(primary_key=True)
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text


class UserQuizAttempt(models.Model):
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
        return f"{self.user.username} - {self.quiz.title} - Score: {self.score}"

