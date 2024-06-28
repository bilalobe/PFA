import pytest
from datetime import datetime
from backend.users.models import User, UserType, UserRole, UserStatus, Permissions

@pytest.fixture
def user():
    return User(
        username="testuser",
        email="testuser@example.com",
        user_type=UserType.STUDENT,
        bio="Test bio",
        profile_picture="path/to/profile_picture.jpg",
        role=UserRole.STUDENT,
        facebook_link="https://www.facebook.com/testuser",
        twitter_link="https://www.twitter.com/testuser",
        linkedin_link="https://www.linkedin.com/in/testuser",
        instagram_link="https://www.instagram.com/testuser",
        status=UserStatus.ACTIVE,
        last_login=datetime.utcnow(),
        courses=["course1", "course2"],
        enrollments=["enrollment1", "enrollment2"],
        user_id="123456789"
    )

def test_user_initialization(user):
    assert user.username == "testuser"
    assert user.email == "testuser@example.com"
    assert user.user_type == UserType.STUDENT
    assert user.bio == "Test bio"
    assert user.profile_picture == "path/to/profile_picture.jpg"
    assert user.is_staff == False
    assert user.is_superuser == False
    assert user.facebook_link == "https://www.facebook.com/testuser"
    assert user.twitter_link == "https://www.twitter.com/testuser"
    assert user.linkedin_link == "https://www.linkedin.com/in/testuser"
    assert user.instagram_link == "https://www.instagram.com/testuser"
    assert user.status == UserStatus.ACTIVE
    assert isinstance(user.last_login, datetime)
    assert user.courses == ["course1", "course2"]
    assert user.enrollments == ["enrollment1", "enrollment2"]
    assert user.user_id == "123456789"

def test_set_role_staff(user):
    user.set_role(UserRole.STAFF)
    assert user.is_staff == True
    assert user.is_superuser == False

def test_set_role_superuser(user):
    user.set_role(UserRole.SUPERUSER)
    assert user.is_staff == False
    assert user.is_superuser == True

def test_set_role_student(user):
    user.set_role(UserRole.STUDENT)
    assert user.is_staff == False
    assert user.is_superuser == False

def test_set_role_invalid(user):
    with pytest.raises(ValueError):
        user.set_role("invalid_role")

def test_profile_completeness(user):
    completeness = user.profile_completeness()
    assert completeness == "100%"

def test_validate_username_valid():
    username = User.validate_username("testuser")
    assert username == "testuser"

def test_validate_username_too_short():
    with pytest.raises(ValueError):
        User.validate_username("us")

def test_validate_username_too_long():
    with pytest.raises(ValueError):
        User.validate_username("thisusernameistoolongtobevalid")

def test_validate_email_valid():
    email = User.validate_email("testuser@example.com")
    assert email == "testuser@example.com"

def test_validate_email_invalid():
    with pytest.raises(ValueError):
        User.validate_email("invalid_email")

def test_permissions_student():
    user = User(username="testuser", email="testuser@example.com", user_type=UserType.STUDENT)
    permissions = user.permissions
    assert permissions == [Permissions.VIEW_COURSE]

def test_permissions_teacher():
    user = User(username="testuser", email="testuser@example.com", user_type=UserType.TEACHER)
    permissions = user.permissions
    assert permissions == [Permissions.VIEW_COURSE, Permissions.EDIT_COURSE, Permissions.CREATE_COURSE]

def test_permissions_supervisor():
    user = User(username="testuser", email="testuser@example.com", user_type=UserType.SUPERVISOR)
    permissions = user.permissions
    assert permissions == [Permissions.VIEW_COURSE, Permissions.EDIT_COURSE, Permissions.CREATE_COURSE, Permissions.DELETE_COURSE]