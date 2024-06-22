from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from users.models import User
from courses.models import Course, CourseVersion, Module


class Enrollment(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={"user_type": "student"})
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
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
