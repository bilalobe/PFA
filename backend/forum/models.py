from django.db import models
from django.contrib.auth.models import User 
from cours.models import Cours  # Assuming forums are associated with courses

class Forum(models.Model):
     title = models.CharField(max_length=255)
     course = models.ForeignKey(Cours, on_delete=models.CASCADE, related_name='forums')
     description = models.TextField(blank=True) 
     created_at = models.DateTimeField(auto_now_add=True) 

     def __str__(self):
         return self.title

class Thread(models.Model):
     forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='threads')
     title = models.CharField(max_length=255)
     created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='threads_created')
     created_at = models.DateTimeField(auto_now_add=True)

     def __str__(self):
         return self.title

class Post(models.Model):
     thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='posts')
     author = models.ForeignKey(User, on_delete=models.CASCADE)
     content = models.TextField()
     created_at = models.DateTimeField(auto_now_add=True)

     def __str__(self):
         return f"{self.author.username} - {self.content[:30]}..."
