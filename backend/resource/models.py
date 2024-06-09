from django.db import models
from django.conf import settings 
from backend.course.models import Module
from .models import User  # Import your User model

def resource_directory_path(instance, filename):
    # File will be uploaded to MEDIA_ROOT/course_<course_id>/module_<module_id>/<filename>
    return f'course_{instance.module.course.id}/module_{instance.module.id}/{filename}' 

class Resource(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to=resource_directory_path)  # Use the directory path function
    upload_date = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)  # Store who uploaded the resource

    def __str__(self):
        return self.title