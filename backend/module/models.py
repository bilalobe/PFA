from django.db import models
from cours.models import Cours
from user.models import User 

class Module(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content = models.TextField(blank=True) 
    course = models.ForeignKey(Cours, on_delete=models.CASCADE, related_name='modules')
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='modules_created')

    class Meta:
        unique_together = ('course', 'order') # Ensure order is unique within a course

    def __str__(self):
        return self.title 