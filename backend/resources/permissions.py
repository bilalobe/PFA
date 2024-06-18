from rest_framework import permissions
from enrollments.models import Enrollment

# Constants for user types
STUDENT = "student"
TEACHER = "teacher"

def is_safe_method(request):
    """Utility function to check if the request method is safe."""
    return request.method in permissions.SAFE_METHODS

class IsEnrolledStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        if is_safe_method(request):
            return True
        return request.user.is_authenticated and request.user.user_type == STUDENT

    def has_object_permission(self, request, view, obj):
        if is_safe_method(request):
            return True
        # Use `exists()` directly for efficiency
        return Enrollment.objects.filter(
            student=request.user, course=obj.module.course
        ).exists()

class IsInstructor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == TEACHER

    def has_object_permission(self, request, view, obj):
        # Directly return the comparison result
        return obj.module.course.instructor == request.user