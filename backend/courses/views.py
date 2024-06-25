from django.http import HttpRequest, JsonResponse
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
from backend.reviews.models import Review
from reviews.serializers import ReviewSerializer
from modules.serializers import ModuleSerializer
import firebase_admin
from firebase_admin import db

from .models import (
    Course,
    UserCourseInteraction,
    CourseVersion,
    CourseAnalytics,
    DynamicContent,
    InteractiveElement,
)
from .serializers import (
    CourseSerializer,
    CourseVersionSerializer,
    CourseAnalyticsSerializer,
    DynamicContentSerializer,
    InteractiveElementSerializer,
    UserCourseInteractionSerializer,
)

from rest_framework.exceptions import NotFound, PermissionDenied
sentiment_analysis_pipeline = pipeline("sentiment-analysis")

class CourseViewSet(viewsets.ModelViewSet):
    """
    A viewset for handling CRUD operations related to courses.

    This viewset provides the following actions:
    - List: Retrieve a list of all courses.
    - Create: Create a new course.
    - Retrieve: Retrieve a specific course by its ID.
    - Update: Update an existing course.
    - Partial Update: Partially update an existing course.
    - Destroy: Delete an existing course.
    - Modules: Retrieve all modules associated with a specific course.
    - Post Review: Post a review for a specific course.
    - Get Reviews: Retrieve all reviews for a specific course.
    - Delete Review: Delete a specific review for a course.
    - Recommend: Get course recommendations for a user.

    This viewset uses the following serializers:
    - CourseSerializer: Serializes/deserializes course data.
    - ModuleSerializer: Serializes/deserializes module data.
    - ReviewSerializer: Serializes/deserializes review data.

    This viewset requires authentication for all actions except for listing and retrieving courses.
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
        """
        Perform additional actions when creating a new course.

        This method is called when a new course is being created. It sets the `created_by` field of the course
        to the currently authenticated user.
        """
        serializer.save(created_by=self.request.user)

    @action(detail=True)
    def modules(self, request, *args, **kwargs):
        """
        Retrieve all modules associated with a specific course.

        This action retrieves all modules that are associated with the course specified by its ID.
        """
        course = self.get_object()
        modules = course.modules.all()
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"])    
    def post_review(self, request: HttpRequest):
        """
        Post a review for a specific course.

        This action allows a user to post a review for a specific course. The review data should be provided
        in the request body as `review_data`, and the ID of the course should be provided as `course_id`.
        """
        if request.method == 'POST':
            review_data = request.POST.get('review_data')
            course_id = request.POST.get('course_id')
            # Assuming db is a Firebase database reference, it should be imported or defined earlier in the code.
            # Importing firebase_admin and initializing db reference.


            # Initialize the app with a service account, granting admin privileges
            if not firebase_admin._apps:
                firebase_admin.initialize_app(options={'databaseURL': 'https://your-database-url.firebaseio.com'})

            ref = db.reference(f'/courses/{course_id}/reviews')
            
            # Push new review data to the database
            ref.push().set(review_data)
            
            return JsonResponse({'success': True, 'message': 'Review posted successfully.'})
        else:
            return JsonResponse({'success': False, 'message': 'Invalid request method.'})

    @action(detail=True, methods=["get"])
    def get_reviews(self, request, *args, **kwargs):
        """
        Retrieve all reviews for a specific course.

        This action retrieves all reviews that are associated with the course specified by its ID.
        """
        course = self.get_object()
        reviews = course.reviews.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["delete"])
    def delete_review(self, request, review_pk=None, **kwargs):
        """
        Delete a specific review for a course.

        This action allows a user to delete a specific review for a course. The review is identified by its
        primary key (`review_pk`). Only the user who posted the review or a staff member can delete it.
        """
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
    def recommend(self, request, *args, **kwargs):
        """
        Get course recommendations for a user.

        This action retrieves course recommendations for the currently authenticated user.
        The recommendations are based on the user's preferences and interests.
        """
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



class CourseVersionViewSet(viewsets.ModelViewSet):
    queryset = CourseVersion.objects.all()
    serializer_class = CourseVersionSerializer

class CourseAnalyticsViewSet(viewsets.ModelViewSet):
    queryset = CourseAnalytics.objects.all()
    serializer_class = CourseAnalyticsSerializer

class DynamicContentViewSet(viewsets.ModelViewSet):
    queryset = DynamicContent.objects.all()
    serializer_class = DynamicContentSerializer

class InteractiveElementViewSet(viewsets.ModelViewSet):
    queryset = InteractiveElement.objects.all()
    serializer_class = InteractiveElementSerializer

class UserCourseInteractionViewSet(viewsets.ModelViewSet):
    queryset = UserCourseInteraction.objects.all()
    serializer_class = UserCourseInteractionSerializer
