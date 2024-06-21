from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils.translation import gettext_lazy as _
from PIL import Image

from backend.courses.models import Course


class UserManager(BaseUserManager):
    """
    Custom user manager to handle user creation and superuser creation.
    """

    def create_user(self, email, username, password=None, **extra_fields):
        """
        Creates and saves a User with the given email, username, and password.
        """
        if not email:
            raise ValueError(_("The Email field is required."))
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        """
        Creates and saves a superuser with the given email, username and passwd
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model that uses email as the username field.
    """

    user_type_choices = (
        ("student", "Student"),
        ("teacher", "Teacher"),
        ("supervisor", "Supervisor"),
    )

    # Existing fields
    username = models.CharField(max_length=32, unique=True)
    email = models.EmailField(max_length=254, unique=True)
    user_type = models.CharField(
        max_length=10, choices=user_type_choices, default="student"
    )
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", blank=True, null=True
    )

    # New fields
    facebook_link = models.URLField(max_length=255, blank=True, null=True)
    twitter_link = models.URLField(max_length=255, blank=True, null=True)
    linkedin_link = models.URLField(max_length=255, blank=True, null=True)
    instagram_link = models.URLField(max_length=255, blank=True, null=True)

    STATUS_CHOICES = (
        ("active", "Active"),
        ("banned", "Banned"),
        ("inactive", "Inactive"),
    )
    status = models.CharField(max_length=10,
                              choices=STATUS_CHOICES, default="active")

    last_login = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()
    courses = models.ManyToManyField(Course, related_name="students")
    enrollments = models.ManyToManyField(
        Course, through="Enrollment", related_name="enrollments"
    )

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.profile_picture:
            self.resize_profile_picture()

    def resize_profile_picture(self):
        """
        Resizes the profile picture to a smaller size (e.g., 200x200)
        while preserving aspect ratio.
        """
        if self.profile_picture:
            try:
                img = Image.open(self.profile_picture.path)
                if img.width > 200 or img.height > 200:
                    img.thumbnail((200, 200))
                    img.save(self.profile_picture.path)
            except IOError as e:
                print(f"Error resizing profile picture: {e}")

    def profile_completeness(self):
        fields = ["username", "email", "bio", "profile_picture"]
        filled_fields = sum(bool(getattr(self, field)) for field in fields)
        total_fields = len(fields)
        completeness = (filled_fields / total_fields) * 100
        return f"{completeness}%"

    def has_permission(self, action):
        permissions = {
            "student": ["view_course"],
            "teacher": ["view_course", "edit_course", "create_course"],
            "supervisor": [
                "view_course",
                "edit_course",
                "create_course",
                "delete_course",
            ],
        }
        return action in permissions.get(self.user_type, [])


class UserActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.activity_type} at {self.timestamp}"
