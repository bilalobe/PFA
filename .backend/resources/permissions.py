from rest_framework import permissions
from enrollments.models import Enrollment

def is_user_of_type(user, user_type):
    """Utility function to check the user's type."""
    return user.is_authenticated and user.user_type == user_type

def is_safe_method(request):
    """Utility function to check if the request method is safe."""
    return request.method in permissions.SAFE_METHODS

class IsEnrolledStudentOrReadOnly(permissions.BasePermission):
    """Allow access to enrolled students or read-only access for safe methods."""
    
    def has_permission(self, request, view):
        return is_safe_method(request) or is_user_of_type(request.user, "student")

    def has_object_permission(self, request, view, obj):
        if is_safe_method(request):
            return True
        return Enrollment.objects.filter(student=request.user, course=obj.module.course).exists()

class IsInstructorOrReadOnly(permissions.BasePermission):
    """Allow full access to instructors and read-only access for others."""
    
    def has_permission(self, request, view):
        return is_safe_method(request) or is_user_of_type(request.user, "teacher")

    def has_object_permission(self, request, view, obj):
        return is_safe_method(request) or obj.module.course.instructor == request.user

class IsModerator(permissions.BasePermission):
    """Allow access only to moderators."""
    
    def has_permission(self, request, view):
        return is_user_of_type(request.user, "supervisor")

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow object owners full access; others have read-only access."""
    
    def has_object_permission(self, request, view, obj):
        return is_safe_method(request) or obj.uploaded_by == request.user