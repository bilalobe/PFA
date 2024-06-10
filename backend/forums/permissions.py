from rest_framework import permissions

class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow only instructors or read-only access.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.user_type == 'teacher' or request.method in permissions.SAFE_METHODS)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user # Only the creator can edit or delete

class IsEnrolledStudentOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow only enrolled students or read-only access.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.user_type == 'student' or request.method in permissions.SAFE_METHODS)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.forum.course.enrollments.filter(student=request.user).exists() # Only enrolled students can create posts
    
    