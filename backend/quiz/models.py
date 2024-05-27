from django.db import models
from cours.models import Module # Import the Module model
from utilisateur.models import Utilisateur 

class Quiz(models.Model):
    title = models.CharField(max_length=255)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='quizzes')
    # Other fields like description, time_limit, passing_score, etc.

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()

class AnswerChoice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    class Meta:
        unique_together = ('question' ,'text',)

class UserQuizAttempt(models.Model):  
    user = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)  
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)  
    score = models.IntegerField(default=0)  
    start_time = models.DateTimeField(auto_now_add=True)  # Automatically set when attempt starts  
    end_time = models.DateTimeField(null=True, blank=True)  # Set when attempt is finished  
    progress = models.IntegerField(default=0)  # Stores the progress percentage  
  
    class Meta:  
        unique_together = ('user', 'quiz',)  