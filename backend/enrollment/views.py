from rest_framework import viewsets, permissions
from .models import Enrollment
from .serializers import EnrollmentSerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)  # Automatically set the logged-in user as the student

    def get_queryset(self):
        # Only show enrollments for the logged-in user
        if self.request.user.is_authenticated:
            if self.request.user.user_type == 'student':
                return Enrollment.objects.filter(student=self.request.user)
            else:
                return Enrollment.objects.filter(course__instructor=self.request.user)
        return Enrollment.objects.none()