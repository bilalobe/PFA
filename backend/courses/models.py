from django.db import models
from django.contrib.auth.models import User
import uuid

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey(
        User, on_delete=models.CASCADE, limit_choices_to={"user_type": "teacher"}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    enrollment_count = models.PositiveIntegerField(default=0)
    completion_rate = models.FloatField(default=0)
    module_set = models.ManyToManyField("Module", related_name="courses", blank=True)

    class Meta:
        indexes = [models.Index(fields=["created_at"])]

    def __str__(self):
        return self.title

class Module(models.Model):
    """
    Represents a module within a course.

    Attributes:
        id (UUIDField): The unique identifier for the module.
        course (ForeignKey): The course that the module belongs to.
        quizzes (ManyToManyField): The quizzes associated with the module.
        title (CharField): The title of the module.
        content (TextField): The content of the module.
        order (PositiveIntegerField): The order of the module within the course.
        created_at (DateTimeField): The date and time when the module was created.
        updated_at (DateTimeField): The date and time when the module was last updated.
        created_by (ForeignKey): The user who created the module.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    quizzes = models.ManyToManyField("Quiz", related_name="modules", blank=True)
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="modules_created")

    class Meta:
        unique_together = ("course", "order")

    def __str__(self):
        return self.title

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveIntegerField(choices=[(1, "1 Star"), (2, "2 Stars"), (3, "3 Stars"), (4, "4 Stars"), (5, "5 Stars")])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} reviewed {self.course.title}"