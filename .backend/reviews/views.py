from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Review
from .serializers import ReviewSerializer, ReviewUpdateSerializer, ReviewLikeSerializer
from .permissions import IsReviewerOrReadOnly
from backend.courses.models import Course
from backend.notifications.firestore_service import FirestoreReviewService


User = get_user_model()


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsReviewerOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.kwargs.get("course_pk")
        rating = self.request.GET.get('rating')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if rating:
            queryset = queryset.filter(rating=rating)
        return queryset

    def perform_create(self, serializer):
        course_id = self.kwargs.get("course_pk")
        course = get_object_or_404(Course, pk=course_id)
        user = self.request.user

        if not FirestoreReviewService.is_user_enrolled_in_course(user.pk, course_id):
            raise PermissionDenied("You must be enrolled in the course to leave a review.")

        serializer.save(user=user, course=course)

    @action(detail=True, methods=['patch'], serializer_class=ReviewUpdateSerializer)
    def update_content(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'], serializer_class=ReviewLikeSerializer)
    def like(self, request, *args, **kwargs):
        review = self.get_object()
        if FirestoreReviewService.has_user_liked_review(request.user.id, review.id):
            return Response({"detail": "You have already liked this review."}, status=status.HTTP_400_BAD_REQUEST)

        FirestoreReviewService.like_review(request.user.id, review.id)
        return Response({"detail": "Review liked successfully."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def dislike(self, request, *args, **kwargs):
        review = self.get_object()
        if not FirestoreReviewService.has_user_liked_review(request.user.id, review.id):
            return Response({"detail": "You have not liked this review."}, status=status.HTTP_400_BAD_REQUEST)

        FirestoreReviewService.dislike_review(request.user.id, review.id)
        return Response({"detail": "Review disliked successfully."}, status=status.HTTP_204_NO_CONTENT)