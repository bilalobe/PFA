from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from users.models import User
from courses.models import Course, CourseVersion, Module


class Enrollment(models.Model):
    """
    Represents an enrollment of a student in a course.

    Attributes:
        id (AutoField): The primary key for the enrollment.
        user (ForeignKey): The user who is enrolled in the course.
        course (ForeignKey): The course that the user is enrolled in.
        student (ForeignKey): The student who is enrolled in the course.
        course_version (ForeignKey): The version of the course that the student is enrolled in.
        enrolled_at (DateTimeField): The date and time when the student enrolled in the course.
        progress (PositiveIntegerField): The percentage of the course completed by the student (0-100).
        completed (BooleanField): Indicates whether the student has completed the course or not.

    Meta:
        unique_together (tuple): Specifies that the combination of student and course should be unique.

    Methods:
        __str__(): Returns a string representation of the enrollment.
        update_progress(): Updates the progress and completion status of the enrollment based on the completed modules.
    """

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={"user_type": "student"})
    course_version = models.ForeignKey(CourseVersion, on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress = models.PositiveIntegerField(default=0, help_text="Percentage of course completed (0-100)")
    completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"

    def update_progress(self):
        completed_modules = ModuleCompletion.objects.filter(enrollment=self, module__course_version=self.course_version).count()
        total_modules = Module.objects.filter(course_version=self.course_version).count()
        if total_modules > 0:
            progress = (completed_modules / total_modules) * 100
            self.progress = progress
            self.completed = progress == 100
            self.save()
            if self.completed:
                from .utils import generate_certificate
                generate_certificate.delay(self.id)


class ModuleCompletion(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name="completions")
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("enrollment", "module")

    def __str__(self):
        return f"{self.enrollment.student.username} completed {self.module.title}"


@receiver(post_save, sender=ModuleCompletion)
def update_enrollment_progress(sender, instance, **kwargs):
    instance.enrollment.update_progress()
