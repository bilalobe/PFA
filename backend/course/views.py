from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter
from django.shortcuts import get_object_or_404
from .models import Module, Course, Quiz
from .serializers import (
    ModuleSerializer, 
    CoursSerializer, 
    QuizSerializer, 
    ModuleDetailSerializer,
    ModuleCreateSerializer, 
    ModuleUpdateSerializer
)
from .permissions import IsTeacher, IsSupervisor, IsTeacherOrReadOnly
from rest_framework import filters
from rest_framework.exceptions import NotFound, PermissionDenied

class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing courses.
    """
    queryset = Course.objects.all()
    serializer_class = CoursSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsTeacherOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at']

    def perform_create(self, serializer):
        """
        Sets the created_by field to the current user when a new course is created.
        """
        serializer.save(created_by=self.request.user)

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

    def handle_exception(self, exc):
        if isinstance(exc, Module.DoesNotExist):
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    
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

