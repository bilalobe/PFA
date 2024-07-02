""" from django.db import models
from django.contrib.auth.models import User
from backend.courses.models import Course, CourseVersion
import uuid


class Module(models.Model):
    Represents a module within a course.

    Attributes:
        id (UUIDField): The unique identifier for the module.
        course (ForeignKey): The course that the module belongs to.
        course_version (ForeignKey): The course version that the module belongs to.
        quizzes (ManyToManyField): The quizzes associated with the module.
        title (CharField): The title of the module.
        content (TextField): The content of the module.
        order (PositiveIntegerField): The order of the module within the course.
        created_at (DateTimeField): The date and time when the module was created.
        updated_at (DateTimeField): The date and time when the module was last updated.
        created_by (ForeignKey): The user who created the module.

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    course_version = models.ForeignKey(CourseVersion, on_delete=models.CASCADE, related_name="modules")
    quizzes = models.ManyToManyField("Quiz", related_name="modules", blank=True)
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="modules_created"
    )

    class Meta:
        unique_together = ("course", "order")

    def __str__(self):
        return self.title
 """