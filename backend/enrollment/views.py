from rest_framework import viewsets, permissions
from .models import Enrollment
from .serializers import EnrollmentSerializer
from .permissions import IsEnrolledStudent


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def perform_create(self, serializer):
        serializer.save(student=self.request.user) 

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return Enrollment.objects.filter(student=user)
        elif user.user_type in ['teacher', 'supervisor']:
            # Return enrollments for courses taught by the teacher/supervisor
            return Enrollment.objects.filter(course__instructor=user)
        return Enrollment.objects.none()

    def get_permissions(self):
        """
        Set specific permissions based on the action.
        - Only authenticated users can retrieve enrollment data.
        - Only the enrolled student can update or delete their enrollment.
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsEnrolledStudent]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]