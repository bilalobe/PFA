""" from django.db import models
from django.contrib.auth.models import User
from backend.modules.models import Module


class Course(models.Model):
    Represents a course in the application.

    Attributes:
        title (str): The title of the course.
        description (str): The description of the course.
        category (str): The category of the course.
        difficulty (str): The difficulty level of the course.
        thumbnail (ImageField): The thumbnail image of the course.
        instructor (ForeignKey): The instructor of the course.
        created_at (DateTimeField): The date and time when the course was created.
        enrollment_count (PositiveIntegerField): The number of enrollments for the course.
        completion_rate (FloatField): The completion rate of the course.
        average_rating (FloatField): The average rating of the course.
        module_set (ManyToManyField): The modules associated with the course.

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)  # New field
    difficulty = models.CharField(max_length=50, blank=True)  # New field
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)  # New field
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={"user_type": "teacher"})
    created_at = models.DateTimeField(auto_now_add=True)
    enrollment_count = models.PositiveIntegerField(default=0)
    completion_rate = models.FloatField(default=0)
    average_rating = models.FloatField(default=0)
    module_set = models.ManyToManyField("Module", related_name="courses", blank=True)

    class Meta:
        indexes = [models.Index(fields=["created_at"])]


class CourseVersion(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="versions")
    version_number = models.PositiveIntegerField()
    description = models.TextField(blank=True)  # New field
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('course', 'version_number')
        ordering = ['-created_at']

    def __str__(self):
        return str(f"{self.course.title} - Version {self.version_number}")



class CourseAnalytics(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='analytics')
    enrollment_count = models.IntegerField(default=0)
    completion_rate = models.FloatField(default=0.0)
    average_score = models.FloatField(default=0.0)
    average_time_spent = models.FloatField(default=0.0)  # New field
    dropout_rate = models.FloatField(default=0.0)  # New field
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    quiz_pass_rate = models.FloatField(default=0.0)  # New field
    average_engagement = models.FloatField(default=0.0)  # New field

    def __str__(self):
        return f"Analytics for {self.course.title}"


class DynamicContent(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='dynamic_contents')
    content_type = models.CharField(max_length=50)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.content_type} for {self.module.title}"
        # Returns a string representation of the object.


class InteractiveElement(models.Model):
    dynamic_content = models.ForeignKey(DynamicContent, on_delete=models.CASCADE, related_name='interactive_elements')
    element_type = models.CharField(max_length=50)  # e.g., 'quiz', 'note'
    content = models.JSONField()  # Stores structured data for the element
    timestamp = models.PositiveIntegerField()  # Time in video (seconds) when the element should appear
    views = models.PositiveIntegerField(default=0)
    interactions = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.element_type} at {self.timestamp} seconds"

class UserCourseInteraction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_interactions")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="user_interactions")
    interaction_type = models.CharField(max_length=50)  # e.g., 'viewed', 'started', 'completed'
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} {self.interaction_type} {self.course.title}"
 """