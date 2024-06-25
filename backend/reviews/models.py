from django.db import models
from backend.courses.models import Course
from backend.users.models import User

class Review(models.Model):
    """
    Represents a review for a course.

    Attributes:
        text (str): The text content of the review.
        user (User): The user who wrote the review.
        course (Course): The course being reviewed.
        rating (int): The rating given to the course (1-5 stars).
        comment (str): Additional comment about the review (optional).
        created_at (datetime): The timestamp when the review was created.
    """

    text = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveIntegerField(
        choices=[
            (1, "1 Star"),
            (2, "2 Stars"),
            (3, "3 Stars"),
            (4, "4 Stars"),
            (5, "5 Stars"),
        ]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} reviewed {self.course.title}"


class ReviewLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name="likes")

    class Meta:
        unique_together = ("user", "review")