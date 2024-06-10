from django.db import models
from user.models import User
from courses.models import Course

class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    progress = models.PositiveIntegerField(default=0, help_text="Percentage of course completed (0-100)")

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"

    def update_progress(self):
        """
        Updates the enrollment progress based on completed modules and quizzes.
        """
        completed_modules = self.completions.count()
        total_modules = self.course.modules.count()
        # ... (Add logic to calculate quiz completion if needed) ...

        if total_modules > 0:
            progress = (completed_modules / total_modules) * 100
            self.progress = progress
            if progress == 100:
                self.completed = True
                from .tasks import generate_certificate_task
                generate_certificate_task.delay(self.id)
            self.save()

class ModuleCompletion(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='completions')
    module = models.ForeignKey('course.Module', on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('enrollment', 'module')

    def __str__(self):
        return f"{self.enrollment.student.username} completed {self.module.title}"