from rest_framework import viewsets, permissions
from .models import Enrollment
from .serializers import EnrollmentSerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.user_type == 'student':
                return self.queryset.filter(student=user)
            elif user.user_type == 'teacher':  # or supervisor
                return self.queryset.filter(course__instructor=user)
        return self.queryset.none()
