from rest_framework import viewsets, permissions, status
from .models import Enrollment
from .serializers import EnrollmentSerializer
from .models import Course
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    Viewset for managing enrollments. Provides actions for listing, retrieving, creating,
    updating, and deleting enrollments.
    """
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Returns a filtered queryset based on user type.
        - Students can only view their own enrollments.
        - Teachers and supervisors can view enrollments for courses they instruct/supervise.
        """
        queryset = super().get_queryset()
        user = self.request.user
        if user.user_type == 'student':
            return queryset.filter(student=user)
        elif user.user_type in ['teacher', 'supervisor']:
            return queryset.filter(course__instructor=user)
        return queryset.none()  # Return empty queryset if user is not authenticated or has an invalid role

    def perform_create(self, serializer):
        """
        Automatically sets the logged-in user as the student upon enrollment.
        """
        serializer.save(student=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Handles the creation of new enrollments. Checks if the user is already enrolled
        before creating a new enrollment.
        """
        course_id = request.data.get('course')
        user = request.user

        if Enrollment.objects.filter(student=user, course_id=course_id).exists():
            return Response({'detail': 'Already enrolled in this course.'}, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_enrollments(request):
    """
    Lists all enrollments for the current user.
    """
    enrollments = Enrollment.objects.filter(student=request.user)
    serializer = EnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)