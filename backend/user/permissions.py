from rest_framework import permissions

class IsOwnProfileOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of a profile to edit it.
    Assumes the model instance has an `user` attribute.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Instance must have an attribute named `user`.
        return obj.user == request.user
    
class IsTeacher(permissions.BasePermission):
    """
    Allows access only to authenticated users with the "teacher" user type.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.user_type == 'teacher')

class IsStudent(permissions.BasePermission):
    """
    Allows access only to authenticated users with the "student" user type.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.user_type == 'student')

class IsSupervisor(permissions.BasePermission):
    """
    Allows access only to authenticated users with the "supervisor" user type.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.user_type == 'supervisor')