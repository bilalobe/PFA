from rest_framework import permissions

class IsOwnProfileOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of a profile to edit it.
    Assumes the model instance has an `user` attribute.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj == request.user