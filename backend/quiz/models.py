from django.db import models
from django.contrib.auth.models import User
from .models import User  

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'teacher'})
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='modules_created')

    class Meta:
        unique_together = ('course', 'order')

    def __str__(self):
        return self.title

class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField() 
    question_type = models.CharField(max_length=20, choices=(
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        # ... other question types
    ), default='multiple_choice')
    order = models.PositiveIntegerField() 
    created_at = models.DateTimeField(auto_now_add=True)
    # ... other question fields

class QuizAnswerChoice(models.Model):
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(choices=((1, '1 Star'), (2, '2 Stars'), (3, '3 Stars'), (4, '4 Stars'), (5, '5 Stars')))
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} reviewed {self.course.title}"

class Comment(models.Model):
    post = models.ForeignKey('forum.Post', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author} commented on {self.post}"

class Moderation(models.Model):
    post = models.ForeignKey('forum.Post', on_delete=models.CASCADE)
    reason = models.CharField(max_length=255, choices=(
        ('spam', 'Spam'),
        ('offensive', 'Offensive Content'),
        ('irrelevant', 'Irrelevant'),
        ('other', 'Other'),
    ))
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    moderator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderated_posts')
    action_taken = models.CharField(max_length=20, choices=(
        ('delete', 'Delete'),
        ('warn', 'Warn User'),
        ('ban', 'Ban User'),
        ('none', 'No Action'),
    ), default='none', blank=True)
    action_description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Moderation Report: {self.reason} on post {self.post.id} by {self.reported_by.username}"