from django.db import models
from django.conf import settings
from courses.models import Module
from django.contrib.auth.models import User


def resource_directory_path(instance, filename):
    return "course_{0}/module_{1}/{2}".format(
        instance.module.course.id, instance.module.id, filename
    )


class Resource(models.Model):
    id = models.AutoField(primary_key=True)
    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name="resources"
    )
    uploaded_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="resources_uploaded"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to=resource_directory_path)
    file_type = models.CharField(max_length=50, blank=True)  # Store file type
    file_size = models.PositiveIntegerField(default=0)  # Store file size in bytes
    upload_date = models.DateTimeField(auto_now_add=True)
    download_count = models.PositiveIntegerField(default=0)
    thumbnail = models.ImageField(upload_to="thumbnails/", blank=True, null=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Calculate and store file size on save
        if self.file:
            self.file_size = self.file.size
            self.file_type = self.file.file.content_type
        super().save(*args, **kwargs)
