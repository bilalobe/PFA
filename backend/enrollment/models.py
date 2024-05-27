from django.db import models
from utilisateur.models import Utilisateur
from cours.models import Cours

class Enrollment(models.Model):
    student = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'})
    course = models.ForeignKey(Cours, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    progress = models.PositiveIntegerField(default=0, help_text="Percentage of course completed (0-100)")

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"
