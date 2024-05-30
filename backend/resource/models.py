from django.db import models
from cours.models import Module

class Resource(models.Model):
    file = models.FileField(upload_to='module_resources/') 
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='module_resources/')
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title