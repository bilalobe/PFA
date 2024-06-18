from asyncio.log import logger
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Enrollment, ModuleCompletion
from .serializers import EnrollmentSerializer
from courses.models import Module
from .utils import generate_certificate
from .tasks import send_enrollment_email_task, send_progress_update_email_task, send_completion_email_task
from django.db import transaction

class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing enrollments.

    This viewset provides the following actions:
    - List: Retrieve a list of all enrollments.
    - Retrieve: Retrieve a specific enrollment by ID.
    - Create: Create a new enrollment.
    - Update: Update an existing enrollment.
    - Partial Update: Partially update an existing enrollment.
    - Destroy: Delete an existing enrollment.
    - Complete Module: Mark a module as completed for a specific enrollment.

    Only authenticated users are allowed to perform these actions.
    """

    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(student=self.request.user)

    def perform_create(self, serializer):
        course = serializer.validated_data["course"]
        if Enrollment.objects.filter(student=self.request.user, course=course).exists():
            return Response(
                {"detail": "You are already enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        enrollment = serializer.save(student=self.request.user)
        # Send enrollment confirmation email
        send_enrollment_email_task(enrollment)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.student != request.user:
            return Response(
                {"detail": "You are not authorized to unenroll from this course."},
                status=status.HTTP_403_FORBIDDEN,
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def complete_module(self, request, *args, **kwargs):
        enrollment = self.get_object()
        module_id = request.data.get("module_id")

        if not module_id:
            return Response(
                {"error": "module_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            module = Module.objects.get(pk=module_id)
        except Module.DoesNotExist:
            return Response(
                {"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if module.course != enrollment.course:
            return Response(
                {"error": "This module does not belong to this course"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent duplicate completions
        if ModuleCompletion.objects.filter(
            enrollment=enrollment, module=module
        ).exists():
            return Response(
                {"detail": "You have already completed this module."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ModuleCompletion.objects.create(enrollment=enrollment, module=module)

        # Update enrollment progress
        self.update_progress(enrollment)

        return Response(
            {"message": "Module completed successfully!"},
            status=status.HTTP_201_CREATED,
        )

    
    def calculate_progress(self, enrollment):
        completed_modules = enrollment.completions.count()
        completed_quizzes = enrollment.quiz_completions.count() 
        total_modules = enrollment.course.modules.count()
        total_quizzes = enrollment.course.quizzes.count()
    
        if total_modules + total_quizzes == 0:
            return 0
    
        return ((completed_modules + completed_quizzes) / (total_modules + total_quizzes)) * 100
    
    @transaction.atomic
    def update_progress(self, enrollment):
        try:
            progress = self.calculate_progress(enrollment)
            enrollment.progress = progress
    
            if progress >= 100:
                enrollment.completed = True
                generate_certificate(enrollment)
    
            enrollment.save()
    
            # Send progress update email
            send_progress_update_email_task(enrollment)
            
            if enrollment.completed:
                send_completion_email_task(enrollment)
                generate_certificate.delay(enrollment.id)
    
        except Exception as e:
            # Log the error
            logger.error(f"Failed to update progress for enrollment {enrollment.id}: {e}")