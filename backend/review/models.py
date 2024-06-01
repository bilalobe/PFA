from django.db import models
from user.models import User
from cours.models import Cours 

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Cours, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(choices=((1, '1 Star'), (2, '2 Stars'), (3, '3 Stars'), (4, '4 Stars'), (5, '5 Stars')))
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} reviewed {self.course.title}"