from django.db import models
from user.models import User
from courses.models import Course, Module
from .models import ModuleCompletion


class Enrollment(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, limit_choices_to={"user_type": "student"}
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="modules"
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completions = models.ManyToManyField(ModuleCompletion)
    progress = models.PositiveIntegerField(
        default=0, help_text="Percentage of course completed (0-100)"
    )


    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"

    def update_progress(self):
        """
        Updates the enrollment progress based on completed modules and quizzes.
        """
        completed_modules = self.completions.count()
        total_modules = self.course.module_set.count()

        if total_modules > 0:
            progress = (completed_modules / total_modules) * 100
            self.progress = progress
            if progress == 100:
                self.completed = True
                from .utils import generate_certificate

                generate_certificate.delay(self.id)
            self.save()


class ModuleCompletion(models.Model):
    enrollment = models.ForeignKey(
        Enrollment, on_delete=models.CASCADE, related_name="completions"
    )
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("enrollment", "module")

    def __str__(self):
        return f"{self.enrollment.student.username} completed {self.module.title}"
