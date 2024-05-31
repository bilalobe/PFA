from rest_framework import viewsets, permissions, status, routers, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cours, Module, Quiz, Enrollment
from .serializers import CoursSerializer, ModuleSerializer, QuizSerializer, EnrollmentSerializer
from .permissions import IsTeacherOrReadOnly
from rest_framework.decorators import api_view


@api_view(['GET'])
def list_enrollments(request):
    enrollments = Enrollment.objects.filter(user=request.user)
    serializer = EnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)


class CoursViewSet(viewsets.ModelViewSet):
    queryset = Cours.objects.all()
    serializer_class = CoursSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsTeacherOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at']

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsTeacherOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['get'])
    def quizzes(self, request, pk=None):
        module = self.get_object()
        quizzes = Quiz.objects.filter(module=module)
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        try:
            module = self.get_object()
            serializer = self.get_serializer(module)
            return Response(serializer.data)
        except Module.DoesNotExist:
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Module.DoesNotExist:
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Module.DoesNotExist:
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

