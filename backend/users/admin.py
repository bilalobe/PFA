from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as AuthUserAdmin
from django.contrib.auth import get_user_model

from backend.enrollments.models import Enrollment
from backend.users.models import UserType

# Define an inline admin class for the Enrollment model
class EnrollmentInline(admin.TabularInline): 
    model = Enrollment
    extra = 1  # Controls how many empty rows are shown in the admin

# Define a custom admin class for User, renamed to avoid conflict with Django's UserAdmin
class CustomUserAdmin(AuthUserAdmin):
    """
    Admin class for managing custom user model.

    This class extends the default Django `AuthUserAdmin` class and provides additional
    functionality for managing custom user model in the admin interface.

    Attributes:
        list_display (tuple): A tuple of field names to be displayed in the admin list view.
        list_filter (tuple): A tuple of field names to be used for filtering in the admin list view.
        search_fields (tuple): A tuple of field names to be used for searching in the admin list view.
        fieldsets (tuple): A tuple of fieldsets to be displayed in the admin detail view.
        inlines (list): A list of inline classes to be displayed in the admin detail view.

    Methods:
        has_add_permission(request, obj=None): Checks if the user has permission to add a new user.
        has_change_permission(request, obj=None): Checks if the user has permission to change an existing user.
    """

    list_display = ('username', 'email', 'user_type', 'is_staff', 'is_superuser', 'last_login') 
    list_filter = ('user_type', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}), 
        ('Personal info', {'fields': ('first_name', 'last_name', 'bio', 'profile_picture')}), 
        ('Permissions', {'fields': ('user_type', 'is_staff', 'is_superuser')}), 
        ('Important dates', {'fields': ('last_login', 'date_joined')}), 
    )
    inlines = [EnrollmentInline] 

    def has_add_permission(self, request, obj=None):
        """
        Checks if the user has permission to add a new user.

        Args:
            request (HttpRequest): The current request object.
            obj (object, optional): The object being added. Defaults to None.

        Returns:
            bool: True if the user has permission to add a new user, False otherwise.
        """
        user_type = getattr(request.user, 'user_type', None)
        return user_type == UserType.SUPERVISOR.value

    def has_change_permission(self, request, obj=None):
        """
        Checks if the user has permission to change an existing user.

        Args:
            request (HttpRequest): The current request object.
            obj (object, optional): The object being changed. Defaults to None.

        Returns:
            bool: True if the user has permission to change an existing user, False otherwise.
        """
        user_type = getattr(request.user, 'user_type', None)
        if user_type:
            return user_type == UserType.TEACHER.value or \
                   user_type == UserType.SUPERVISOR.value or \
                   (user_type == UserType.STUDENT.value and request.method in ['GET', 'HEAD'])
        return False

# Register the User model with the admin interface using the renamed CustomUserAdmin
User = get_user_model()
admin.site.register(User, CustomUserAdmin)