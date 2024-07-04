import pytest
from django.contrib.auth import get_user_model
from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory

from backend.users.admin import CustomUserAdmin, EnrollmentInline
from backend.users.models import UserType

User = get_user_model()


@pytest.fixture
def admin_site():
    return AdminSite()


@pytest.fixture
def request_factory():
    return RequestFactory()


@pytest.fixture
def user():
    if hasattr(User.objects, 'create_user'):
        return User.objects.create(username="testuser", password="testpassword")
    else:
        # Fallback method if create_user is not available
        user = User(username="testuser")
        user.set_password("testpassword")
        user.save()
        return user


@pytest.fixture
def custom_user_admin(admin_site):
    return CustomUserAdmin(User, admin_site)


def test_list_display(custom_user_admin):
    assert custom_user_admin.list_display == (
        'username', 'email', 'user_type', 'is_staff', 'is_superuser', 'last_login'
    )

def test_list_filter(custom_user_admin):
    assert custom_user_admin.list_filter == (
        'user_type', 'is_staff', 'is_superuser', 'is_active'
    )


def test_search_fields(custom_user_admin):
    assert custom_user_admin.search_fields == ('username', 'email')


def test_fieldsets(custom_user_admin):
    assert custom_user_admin.fieldsets == (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'bio', 'profile_picture')}),
        ('Permissions', {'fields': ('user_type', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


def test_inlines(custom_user_admin):
    assert custom_user_admin.inlines == [EnrollmentInline]


def test_has_add_permission_supervisor(custom_user_admin, request_factory, user):
    request = request_factory.get('/')
    request.user = user
    user.user_type = UserType.SUPERVISOR.value
    assert custom_user_admin.has_add_permission(request) is True


def test_has_add_permission_teacher(custom_user_admin, request_factory, user):
    request = request_factory.get('/')
    request.user = user
    user.user_type = UserType.TEACHER.value
    assert custom_user_admin.has_add_permission(request) is False


def test_has_add_permission_student(custom_user_admin, request_factory, user):
    request = request_factory.get('/')
    request.user = user
    user.user_type = UserType.STUDENT.value
    assert custom_user_admin.has_add_permission(request) is False


def test_has_change_permission_supervisor(custom_user_admin, request_factory, user):
    request = request_factory.get('/')
    request.user = user
    user.user_type = UserType.SUPERVISOR.value
    assert custom_user_admin.has_change_permission(request) is True


def test_has_change_permission_teacher(custom_user_admin, request_factory, user):
    request = request_factory.get('/')
    request.user = user
    user.user_type = UserType.TEACHER.value
    assert custom_user_admin.has_change_permission(request) is True


def test_has_change_permission_student_get(custom_user_admin, request_factory, user):
    request = request_factory.get('/')
    request.user = user
    user.user_type = UserType.STUDENT.value
    assert custom_user_admin.has_change_permission(request) is True


def test_has_change_permission_student_post(custom_user_admin, request_factory, user):
    request = request_factory.post('/')
    request.user = user
    user.user_type = UserType.STUDENT.value
    assert custom_user_admin.has_change_permission(request) is False