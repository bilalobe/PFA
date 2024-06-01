from django.db import models
from cours.models import Module
from user.models import User

class Quiz(models.Model):
    title = models.CharField(max_length=255)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='quizzes')
    description = models.TextField(blank=True, null=True)
    time_limit = models.IntegerField(default=60)
    passing_score = models.IntegerField(default=60)

    class Meta:
        unique_together = ('module', 'title')

    def __str__(self):
        return self.title

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()

    class Meta:
        unique_together = ('quiz', 'text')

    def __str__(self):
        return self.text

class AnswerChoice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    class Meta:
        unique_together = ('question', 'text')

    def __str__(self):
        return self.text

class UserQuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    end_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'quiz')

    def calculate_progress(self):
        total_questions = self.quiz.questions.count()
        if total_questions == 0:
            return 0
        progress = (self.score / total_questions) * 100
        return min(progress, 100)

    def save(self, *args, **kwargs):
        # Save progress to user model or other model if needed
        self.user.progress = self.calculate_progress()
        self.user.save()

        # Save UserQuizAttempt
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.user} - {self.quiz}'
