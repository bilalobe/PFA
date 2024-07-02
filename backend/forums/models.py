""" from django.db import models

from backend.courses.models import Course, Module


class Forum(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["title"]),
            models.Index(fields=["description"]),
        ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="forums", null=True, blank=True)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="forums", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
 """