from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Review
from .serializers import ReviewSerializer
from course.models import Course 
from forum.permissions import IsEnrolledStudentOrReadOnly 

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.kwargs.get('course_pk')
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def perform_create(self, serializer):
        """
        Create a new review, associating it with the user and course.
        Checks if the user is enrolled in the course.
        """
        course_id = self.kwargs.get('course_pk')
        course = get_object_or_404(Course, pk=course_id)

        # Check if the user is enrolled in the course
        if not self.request.user.enrollments.filter(course=course).exists():
            raise PermissionDenied("You must be enrolled in the course to leave a review.")

        serializer.save(user=self.request.user, course=course)

    # Add other methods or actions for reviews (e.g., updating a review, deleting a review, etc.)