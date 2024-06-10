from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied
from .models import Module, Course, Quiz, Review
from .serializers import (
    ModuleSerializer, 
    CourseSerializer, 
    QuizSerializer, 
    ReviewSerializer, 
    ModuleDetailSerializer, 
    ModuleCreateSerializer, 
    ModuleUpdateSerializer,
    ReviewCreateSerializer
)
from .permissions import IsTeacher, IsSupervisor, IsTeacherOrReadOnly
from rest_framework import filters
from django.db.models import Avg


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing courses.
    """
    queryset = Course.objects.all().annotate(average_rating=Avg('reviews__rating'))
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsTeacherOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at', 'average_rating']

    def perform_create(self, serializer):
        """
        Sets the created_by field to the current user when a new course is created.
        """
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None):
        """
        Retrieves a list of modules associated with the specified course.
        """
        course = self.get_object()
        modules = course.modules.all()
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reviews(self, request, pk=None):
        """
        Creates a new review for the specified course.
        Only authenticated users can create reviews.
        Checks if the user is enrolled in the course before creating the review.
        """
        course = self.get_object()
        serializer = ReviewCreateSerializer(data=request.data, context={'request': request, 'course': course})
        if serializer.is_valid():
            serializer.save()  # The serializer will handle associating the course and user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def get_reviews(self, request, pk=None):
        """
        Retrieves a list of reviews associated with the specified course.
        """
        course = self.get_object()
        reviews = course.reviews.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def delete_review(self, request, pk=None, review_pk=None):
        """
        Deletes a review associated with the specified course.
        Only the author of the review or an instructor can delete the review.
        """
        course = self.get_object()
        try:
            review = course.reviews.get(pk=review_pk)
        except Review.DoesNotExist:
            raise NotFound("Review not found")

        if review.user != request.user and course.instructor != request.user:
            raise PermissionDenied("You are not authorized to delete this review.")

        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ... (The rest of your views (ModuleViewSet, QuizViewSet) remain unchanged)

class ModuleViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing modules within a course.
    """
    queryset = Module.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsTeacherOrReadOnly]

    def get_serializer_class(self):
        """
        Returns the appropriate serializer class based on the action.
        """
        if self.action == 'list':
            return ModuleSerializer
        if self.action == 'retrieve':
            return ModuleDetailSerializer
        if self.action == 'create':
            return ModuleCreateSerializer
        if self.action in ['update', 'partial_update']:
            return ModuleUpdateSerializer
        return ModuleSerializer

    def perform_create(self, serializer):
        """
        Associates the new module with the specified course and sets the created_by field.
        Handles potential errors if the course does not exist.
        """
        course_id = self.kwargs.get('course_pk')
        course = get_object_or_404(Course, pk=course_id) 
        serializer.save(course=course, created_by=self.request.user) 

    @action(detail=True, methods=['get'])
    def quizzes(self, request, pk=None):
        """
        Retrieves a list of quizzes associated with the specified module.
        """
        module = self.get_object()
        quizzes = Quiz.objects.filter(module=module)
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieves a specific module.
        Handles the Module.DoesNotExist exception with a 404 response.
        """
        try:
            module = self.get_object()
        except Module.DoesNotExist:
            raise NotFound(detail="Module not found.")
        serializer = self.get_serializer(module)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """
        Updates a specific module.
        Handles the Module.DoesNotExist exception with a 404 response.
        Checks if the user is authorized to update the module.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Check if the user is authorized to update the module
        if instance.course.created_by != request.user:
            raise PermissionDenied(detail="You do not have permission to update this module.")

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Deletes a specific module.
        Handles the Module.DoesNotExist exception with a 404 response.
        Checks if the user is authorized to delete the module.
        """
        instance = self.get_object()

        # Check if the user is authorized to delete the module
        if instance.course.created_by != request.user:
            raise PermissionDenied(detail="You do not have permission to delete this module.")

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

