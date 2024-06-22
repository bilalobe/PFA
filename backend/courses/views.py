import numpy as np
from sklearn.neighbors import NearestNeighbors
from django.core.cache import cache
from transformers import pipeline
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Avg
from .models import Course, Review, UserCourseInteraction
from .serializers import CourseSerializer, ModuleSerializer, ReviewSerializer, ReviewCreateSerializer
from rest_framework.exceptions import NotFound, PermissionDenied

# Initialize the sentiment analysis pipeline
sentiment_analysis_pipeline = pipeline("sentiment-analysis")

class CourseViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing course instances.
    """
    queryset = Course.objects.all().annotate(
        average_rating=Avg("reviews__rating")
    )
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ["title", "description"]
    ordering_fields = ["title", "created_at", "average_rating"]
    filterset_fields = ["created_by", "average_rating"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["get"])
    def modules(self, request, *args, **kwargs):
        course = self.get_object()
        modules = course.modules.all()
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def reviews(self, request, *args, **kwargs):
        course = self.get_object()
        serializer = ReviewCreateSerializer(
            data=request.data,
            context={"request": request, "course": course}
        )
        if serializer.is_valid():
            review = serializer.save()
            # Convert review to a list if it's not already one
            review_texts = [review.text] if not isinstance(review, list) else [r.text for r in review]
            sentiments = list(sentiment_analysis_pipeline(review_texts))
            # Apply sentiment to the review or each review in the list
            if not isinstance(review, list):
                review.sentiment = sentiments[0]['label']
                review.save()
            else:
                for i, r in enumerate(review):
                    r.sentiment = sentiments[i]['label']
                    r.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def get_reviews(self, request, pk=None):
        course = self.get_object()
        reviews = course.reviews.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["delete"])
    def delete_review(self, request, pk=None, review_pk=None):
        course = self.get_object()
        try:
            review = course.reviews.get(pk=review_pk)
        except Review.DoesNotExist:
            raise NotFound("Review not found")
        if review.user != request.user and not request.user.is_staff:
            raise PermissionDenied("You are not authorized to delete this review.")
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"])
    def recommend(self, request, pk=None):
        user = request.user
        recommendations = recommend_courses(user.id)
        serializer = CourseSerializer(recommendations, many=True)
        return Response(serializer.data)

def get_user_course_matrix():
    interactions = UserCourseInteraction.objects.all().values('user_id', 'course_id', 'interaction_score')
    if not interactions:
        return None, None
    user_ids = sorted(list(set([interaction['user_id'] for interaction in interactions])))
    course_ids = sorted(list(set([interaction['course_id'] for interaction in interactions])))
    user_index = {user_id: index for index, user_id in enumerate(user_ids)}
    course_index = {course_id: index for index, course_id in enumerate(course_ids)}
    matrix = np.zeros((len(user_ids), len(course_ids)))
    for interaction in interactions:
        user_idx = user_index[interaction['user_id']]
        course_idx = course_index[interaction['course_id']]
        matrix[user_idx][course_idx] = interaction['interaction_score']
    return matrix, user_ids, course_ids

def recommend_courses(user_id, num_recommendations=5):
    """
    Recommend courses based on user's interaction with other courses.
    """
    # Fix for "None" is not iterable issue
    user_course_matrix_data = cache.get_or_set('user_course_matrix', get_user_course_matrix, timeout=3600)
    if user_course_matrix_data is None:
        return []
    matrix, user_ids, course_ids = user_course_matrix_data

    if user_id not in user_ids:
        return []

    user_idx = user_ids.index(user_id)
    # Adjusting line length for PEP 8 compliance
    model = NearestNeighbors(
        n_neighbors=num_recommendations + 1, algorithm='auto'
    ).fit(matrix)
    distances, indices = model.kneighbors(matrix[user_idx].reshape(1, -1))

    # Fix for unused variable 'distances'
    _ = distances

    recommended_course_ids = [
        course_ids[idx] for idx in indices.flatten() if idx != user_idx
    ][:num_recommendations]
    recommended_courses = Course.objects.filter(id__in=recommended_course_ids)
    return recommended_courses

class ReviewViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing review instances.
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        review = serializer.save()
        review_texts = [review.text]
        # Fix for "__getitem__" method not defined on type "Generator[Any, Any, None]"
        sentiments = list(sentiment_analysis_pipeline(review_texts))
        review.sentiment = sentiments[0]['label']
        review.save()
