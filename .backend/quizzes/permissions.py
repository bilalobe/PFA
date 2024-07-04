from rest_framework import permissions


class IsTeacherOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow teachers to edit objects and everyone else to only view.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True  # Allow all users to view (GET, HEAD, OPTIONS)
        return request.user.is_authenticated and request.user.user_type == "teacher"
