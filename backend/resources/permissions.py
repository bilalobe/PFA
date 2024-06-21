from rest_framework import permissions
from enrollments.models import Enrollment


def is_safe_method(request):
    """Utility function to check if the request method is safe."""
    return request.method in permissions.SAFE_METHODS


class IsEnrolledStudent(permissions.BasePermission):
    def has_permission(self, request):
        if is_safe_method(request):
            return True
        # Adjusted to use the User model's attributes
        return request.user.is_authenticated and request.user.user_type == "student"

    def has_object_permission(self, request, obj):
        if is_safe_method(request):
            return True
        # Adjusted to use the User model's attributes
        return Enrollment.objects.filter(
            student=request.user, course=obj.module.course
        ).exists()


class IsInstructor(permissions.BasePermission):
    def has_permission(self, request):
        # Adjusted to use the User model's attributes
        return request.user.is_authenticated and request.user.user_type == "teacher"

    def has_object_permission(self, request, obj):
        # Adjusted to use the User model's attributes
        return obj.module.course.instructor == request.user


class IsModerator(permissions.BasePermission):
    """
    Custom permission to only allow moderators to flag resources.
    """

    def has_permission(self, request):
        # Adjusted to use the User model's attributes
        return request.user.is_authenticated and request.user.user_type == "supervisor"
