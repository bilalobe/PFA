from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cours, Module, Quiz, Enrollment
from .serializers import CoursSerializer, ModuleSerializer, QuizSerializer, EnrollmentSerializer
from .permissions import IsTeacherOrReadOnly, IsSupervisor

class CoursViewSet(viewsets.ModelViewSet):
    queryset = Cours.objects.all()
    serializer_class = CoursSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly | IsSupervisor]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at']

    def get_queryset(self):
        queryset = Cours.objects.all()
        if self.request.user.user_type == 'student':
            queryset = queryset.filter(enrollments__student=self.request.user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None):
        course = self.get_object()
        modules = Module.objects.filter(cours=course)
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly | IsSupervisor] # Adjust as needed

    def perform_create(self, serializer):
        serializer.save(cours_id=self.kwargs.get('cours_pk'), created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def quizzes(self, request, pk=None):
        module = self.get_object()
        quizzes = Quiz.objects.filter(module=module)
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

