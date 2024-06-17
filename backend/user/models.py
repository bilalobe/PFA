from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils.translation import gettext_lazy as _
from PIL import Image


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
        Creates and saves a superuser with the given email, username, and password.
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

    user_type = (
        ("student", "Student"),
        ("teacher", "Teacher"),
        ("supervisor", "Supervisor"),
    )

    username = models.CharField(max_length=32, unique=True)
    email = models.EmailField(max_length=254, unique=True)
    user_type = models.CharField(max_length=10, choices=user_type, default="student")
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", blank=True, null=True
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.profile_picture:
            from .utils import resize_profile_picture

            resize_profile_picture(self.profile_picture.path)

    def resize_profile_picture(self):
        """
        Resizes the profile picture to a smaller size (e.g., 200x200) while preserving aspect ratio.
        """
        if self.profile_picture:
            try:
                img = Image.open(self.profile_picture.path)
                if img.width > 200 or img.height > 200:
                    img.thumbnail((200, 200))
                    img.save(self.profile_picture.path)
            except IOError as e:
                print(f"Error resizing profile picture: {e}")
