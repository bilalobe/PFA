from rest_framework import permissions


class IsTeacher(permissions.BasePermission):
    """
    Custom permission to only allow teachers to access a view.
    """

    def has_permission(self, request, view):
        # Check if the user is authenticated and has the 'teacher' user type.
        return (
            request.user
            and request.user.is_authenticated
            and request.user.profile.user_type == "teacher"
        )


class IsSupervisor(permissions.BasePermission):
    """
    Custom permission to only allow supervisors to access a view.
    """

    def has_permission(self, request, view):
        # Check if the user is authenticated and has the 'supervisor' user type.
        return (
            request.user
            and request.user.is_authenticated
            and request.user.profile.user_type == "supervisor"
        )


class IsTeacherOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            obj.instructor == request.user
            and request.user.profile.user_type == "teacher"
        )
