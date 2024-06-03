# backend/enrollment/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Enrollment
from .serializers import EnrollmentSerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Ensure that users can only see their own enrollments
        return self.queryset.filter(student=self.request.user)

    def perform_create(self, serializer):
        course = serializer.validated_data['course']

        # Check if the user is already enrolled in the course
        if Enrollment.objects.filter(student=self.request.user, course=course).exists():
            return Response(
                {"detail": "You are already enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save(student=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Check if the user is the student of the enrollment
        if instance.student != request.user:
            return Response(
                {"detail": "You are not authorized to unenroll from this course."},
                status=status.HTTP_403_FORBIDDEN
            )

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)