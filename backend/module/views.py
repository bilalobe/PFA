from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from .models import Module
from .serializers import (
    ModuleSerializer, 
    ModuleDetailSerializer, 
    ModuleCreateSerializer,
    ModuleUpdateSerializer,
)
from .permissions import IsInstructorOrReadOnly
from course.models import Course

class ModuleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows modules to be viewed or edited.
    """
    queryset = Module.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsInstructorOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['order', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ModuleSerializer
        elif self.action == 'retrieve':
            return ModuleDetailSerializer
        elif self.action == 'create':
            return ModuleCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ModuleUpdateSerializer
        return ModuleSerializer

    def get_queryset(self):
        queryset = Module.objects.all()
        course_id = self.request.query_params.get('course')
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_pk')
        course = Course.objects.get(pk=course_id)
        serializer.save(course=course, created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Module.DoesNotExist:
            raise NotFound("Module not found.")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT) 