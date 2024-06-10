from pytz import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from backend.enrollments.tasks import generate_certificate_task
from .models import Enrollment, ModuleCompletion, Certificate
from .serializers import EnrollmentSerializer
from .permissions import IsOwnEnrollmentOrReadOnly
from .utils import send_enrollment_email, generate_certificate
from backend.storage.azure_storage import AzureStorage
from courses.models import Module
import os
from django.conf import settings
from django.http import FileResponse, HttpResponseRedirect
import logging
from django.db import transaction

logger = logging.getLogger(__name__)

class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing enrollments.
    """
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnEnrollmentOrReadOnly] 

    def get_queryset(self):
        return self.queryset.filter(student=self.request.user)

    def perform_create(self, serializer):
        """
        Handles enrollment creation, prevents duplicate enrollments, and sends a confirmation email.
        """
        course = serializer.validated_data['course']
        if Enrollment.objects.filter(student=self.request.user, course=course).exists():
            return Response(
                {"detail": "You are already enrolled in this course."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        enrollment = serializer.save(student=self.request.user)
        send_enrollment_email(enrollment, f"Welcome to {course.title}!", 'enrollment/enrollment_confirmation.html')
        if enrollment.completed and not enrollment.certificate_url: 
            generate_certificate_task.delay(enrollment.id)  
    def destroy(self, request, *args, **kwargs):
        """
        Handles unenrollment, checking if the user is authorized to unenroll.
        """
        instance = self.get_object()
        if instance.student != request.user:
            return Response(
                {"detail": "You are not authorized to unenroll from this course."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def complete_module(self, request, pk=None):
        """
        Marks a module as complete for the enrollment, preventing duplicate completions.
        """
        enrollment = self.get_object()
        module_id = request.data.get('module_id')

        if not module_id:
            return Response({'error': 'module_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            module = Module.objects.get(pk=module_id)
        except Module.DoesNotExist:
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)

        if module.course != enrollment.course:
            return Response({'error': 'This module does not belong to this course'}, status=status.HTTP_400_BAD_REQUEST)

        if ModuleCompletion.objects.filter(enrollment=enrollment, module=module).exists():
            return Response({'detail': 'You have already completed this module.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():  # Use a transaction for atomicity
            ModuleCompletion.objects.create(enrollment=enrollment, module=module)
            self.update_progress(enrollment)

        return Response({'message': 'Module completed successfully!'}, status=status.HTTP_201_CREATED)

    def update_progress(self, enrollment):
        """
        Updates the enrollment progress based on completed modules and quizzes.
        If progress is 100%, marks enrollment as completed and generates a certificate.
        """
        completed_modules = enrollment.completions.count()
        total_modules = enrollment.course.modules.count()

        # Calculate quiz completion (you'll need to implement this logic)
        completed_quizzes = self.calculate_completed_quizzes(enrollment)
        total_quizzes = enrollment.course.quizzes.count()

        total_items = total_modules + total_quizzes
        completed_items = completed_modules + completed_quizzes

        if total_items > 0:
            progress = int((completed_items / total_items) * 100)
            enrollment.progress = progress

            if progress == 100 and not enrollment.completed:
                enrollment.completed = True
                enrollment.completed_at = timezone.now()
                # Create a certificate
                Certificate.objects.create(enrollment=enrollment)
                send_enrollment_email(enrollment, f"Congratulations! You've Completed {enrollment.course.title}!", 'enrollment/course_completed.html') 

            enrollment.save()

    def calculate_completed_quizzes(self, enrollment):
        """
        Helper function to calculate the number of completed quizzes for an enrollment.
        """
        # Implement your logic here to determine completed quizzes based on UserQuizAttempt
        return 0  # Replace with your actual calculation

     @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def certificate(self, request, pk=None):
        enrollment = self.get_object()
        if enrollment.completed and enrollment.certificate_url:
            azure_storage = AzureStorage()
            # Generate a signed URL for the certificate
            signed_url = azure_storage.url(enrollment.certificate_url, expire=3600) # Expires in 1 hour
            return HttpResponseRedirect(signed_url)
        elif enrollment.completed:
            return Response({'detail': 'Certificate is being generated. Please check back later.'}, status=status.HTTP_202_ACCEPTED)
        else:
            return Response({'detail': 'Course not yet completed.'}, status=status.HTTP_400_BAD_REQUEST)