import certifi
from django.db import models
from user.models import User
from courses.models import Course

class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    progress = models.PositiveIntegerField(default=0, help_text="Percentage of course completed (0-100)")
    certificate_url = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"

class ModuleCompletion(models.Model): 
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='completions')
    module = models.ForeignKey('course.Module', on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('enrollment', 'module')

    def __str__(self):
        return f"{self.enrollment.student.username} completed {self.module.title}"
    
class Certificate(models.Model):
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='certificate')
    issued_at = models.DateTimeField(auto_now_add=True)
    id = models.CharField(max_length=10, primary_key=True)

    def __str__(self):
        return f"Certificate for {self.enrollment.student.username} in {self.enrollment.course.title}"