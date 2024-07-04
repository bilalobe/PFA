from rest_framework import permissions

class IsReviewerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow reviewers of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
