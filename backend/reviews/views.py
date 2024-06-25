from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Review, ReviewLike
from .serializers import ReviewSerializer, ReviewUpdateSerializer, ReviewLikeSerializer
from backend.courses.models import Course

User = get_user_model()

class ReviewViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing reviews.

    This viewset provides CRUD operations for reviews, as well as additional actions
    such as updating the content of a review, liking a review, and disliking a review.
    """

    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.kwargs.get("course_pk")
        rating = self.request.GET.get('rating', None)
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)
        if rating is not None:
            queryset = queryset.filter(rating=rating)
        return queryset

    def perform_create(self, serializer):
        course_id = self.kwargs.get("course_pk")
        course = get_object_or_404(Course, pk=course_id)
        user = self.request.user
        if not user.is_authenticated:
            raise PermissionDenied("You must be logged in to leave a review.")

        # Check if the user is enrolled in the course
        # Adjusted to handle both AnonymousUser and custom user model without 'enrollments' directly
        if hasattr(user, 'enrollments') and hasattr(user, 'is_staff'):
            # if not user.enrollments.filter(course=course).exists() and not user.is_staff:
                raise PermissionDenied("You must be enrolled in the course to leave a review.")
        else:
            # This block now correctly handles cases where the user model does not have the expected attributes
            # For example, when user is an AnonymousUser or a custom user model without these fields
            raise PermissionDenied("You must be enrolled in the course to leave a review.")

        serializer.save(user=user, course=course)


    def perform_update(self, serializer):
        review = self.get_object()
        if review.user != self.request.user:
            raise PermissionDenied("You do not have permission to edit this review.")
        serializer.save()

    @action(detail=True, methods=['patch'], serializer_class=ReviewUpdateSerializer)
    def update_content(self, request, *args, **kwargs):
        """
        Allows updating the content of a review.
        """
        review = self.get_object()
        if review.user != request.user:
            return Response({"detail": "You do not have permission to update this review."}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], serializer_class=ReviewLikeSerializer)
    def like(self, request, *args, **kwargs):
        """
        Allows users to like a review.
        """
        review = self.get_object()
        _, created = ReviewLike.objects.get_or_create(user=request.user, review=review)
        if not created:
            return Response({"detail": "You have already liked this review."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Review liked successfully."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def dislike(self, request, *args, **kwargs):
        """
        Allows users to dislike a review by removing their like.
        """
        review = self.get_object()
        try:
            review_like = ReviewLike.objects.get(user=request.user, review=review)
            review_like.delete()
            return Response({"detail": "Review dislike successfully."}, status=status.HTTP_204_NO_CONTENT)
        except ReviewLike.DoesNotExist:
            return Response({"detail": "You have not liked this review."}, status=status.HTTP_400_BAD_REQUEST)