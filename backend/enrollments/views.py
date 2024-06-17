from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Enrollment, ModuleCompletion
from .serializers import EnrollmentSerializer
from courses.models import Module
from .tasks import generate_certificate_task


class EnrollmentViewSet(viewsets.ModelViewSet):
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
        from .utils import send_enrollment_email

        send_enrollment_email(
            enrollment,
            f"Welcome to {course.title}!",
            "enrollment/enrollment_confirmation.html",
        )

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
    def complete_module(self, request, pk=None):
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

    def update_progress(self, enrollment):
        """
        Updates the enrollment progress based on completed modules and quizzes.
        """
        completed_modules = enrollment.completions.count()
        total_modules = enrollment.course.modules.count()
        # ... (Add logic to calculate quiz completion if needed) ...

        if total_modules > 0:
            progress = (completed_modules / total_modules) * 100
            enrollment.progress = progress
            if progress == 100:
                enrollment.completed = True
                # ... Generate and save certificate here (see previous examples) ...
            enrollment.save()
