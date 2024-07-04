""" from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from common.firestore_mixins import FirestoreDocumentMixin
from google.cloud.firestore import Timestamp # type: ignore

class Review(FirestoreDocumentMixin, models.Model):
    Represents a course review by a user.
    id = models.AutoField(primary_key=True)
    text = models.TextField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(choices=[(i, f"{i} Star{'s' * (i>1)}") for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        Validates the rating is between 1 and 5.
        super().clean()
        if not 1 <= self.rating <= 5:
            raise ValidationError({'rating': 'Rating must be between 1 and 5.'})

    def __str__(self):
        return f"Review by {self.user.username} for {self.course.title} - {self.rating} Stars"

    def to_firestore_doc(self):
        Converts the review instance to a Firestore document.
        return {
            "text": self.text,
            "user_id": self.user.id,
            "course_id": self.course.id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": Timestamp.from_datetime(self.created_at).isoformat(),
        }

    @classmethod
    def get_average_rating_for_course(cls, course_id):
        Calculates the average rating for a given course.
        reviews = cls.objects.filter(course_id=course_id)
        if reviews.exists():
            return reviews.aggregate(models.Avg('rating'))['rating__avg']
        return None

class ReviewLike(FirestoreDocumentMixin, models.Model):
    Represents a 'like' given by a user to a review.
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'review')

    def __str__(self):
        return f"{self.user.username} likes Review {self.review.id}"

    def to_firestore_doc(self):
        Converts the review like instance to a Firestore document.
        return {
            "user_id": self.user.id,
            "review_id": self.review.id,
            "created_at": Timestamp.from_datetime(self.created_at).isoformat(),
        }

    @classmethod
    def count_likes_for_review(cls, review_id):
        Counts the number of likes for a given review.
        
        return cls.objects.filter(review_id=review_id).count()
 """