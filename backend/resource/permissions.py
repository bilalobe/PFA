from rest_framework import permissions
from enrollment.models import Enrollment 

class IsEnrolledStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check if the user is authenticated and a student
        return request.user.is_authenticated and request.user.user_type == 'student' 

    def has_object_permission(self, request, view, obj):
        # Check if the user is enrolled in the course associated with the resource
        return Enrollment.objects.filter(student=request.user, course=obj.module.course).exists()
    
class IsInstructor(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check if the user is authenticated and an instructor
        return request.user.is_authenticated and request.user.user_type == 'teacher' 

    def has_object_permission(self, request, view, obj):
        # Check if the user is the instructor of the course associated with the resource
        return obj.module.course.instructor == request.user 