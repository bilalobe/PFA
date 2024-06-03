from django.db import models
from course.models import Module
from django.contrib.auth.models import User
from django.utils import timezone

class Quiz(models.Model):
    title = models.CharField(max_length=255)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='quizzes')
    description = models.TextField(blank=True, null=True)
    time_limit = models.IntegerField(help_text="Time limit for quiz in minutes", null=True, blank=True)
    passing_score = models.IntegerField(help_text="Minimum score to pass the quiz", null=True, blank=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    QUESTION_TYPES = (
        ('MCQ', 'Multiple Choice Question'),
        ('TF', 'True/False'),
        # Add other types if needed
    )
    question_type = models.CharField(max_length=3, choices=QUESTION_TYPES, default='MCQ')
    difficulty = models.IntegerField(default=1)  # 1: Easy, 2: Medium, 3: Hard
    media = models.FileField(upload_to='question_media/', blank=True, null=True)  # For image/audio/video

    def __str__(self):
        return f'{self.quiz.title} - {self.text}'

class AnswerChoice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text

    class Meta:
        unique_together = ('question', 'text')

class UserQuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)
    progress = models.IntegerField(default=0)
    attempts = models.IntegerField(default=1)
    time_taken = models.DurationField(null=True, blank=True)  # Track time taken

    def __str__(self):
        return f'User {self.user.username} attempt on {self.quiz.title}'

class DetailedUserPerformance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choices = models.ManyToManyField(AnswerChoice)
    correct = models.BooleanField(default=False)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'User {self.user.username} performance on {self.question.text}'
