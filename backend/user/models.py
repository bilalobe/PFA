from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        """
        Creates and saves a User with the given username, email, and password.
        """
        if not email:
            raise ValueError(_('The Email field is required.'))

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """
        Creates and saves a superuser with the given username, email, and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('supervisor', 'Supervisor'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='student')
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    username = models.CharField(max_length=32, unique=True)
    email = models.EmailField(max_length=254, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    progress = models.IntegerField(default=0) 

    role = models.CharField(max_length=50, choices=(('apprenant', 'Apprenant'), ('formateur', 'Formateur')))
    niveau_competence = models.CharField(max_length=50, blank=True, null=True)  # Specific to 'apprenant'
    domaine_expertise = models.CharField(max_length=50, blank=True, null=True)  # Specific to 'formateur'

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        """
        Returns the full name of the user.
        """
        return f"{self.first_name} {self.last_name}"

    @property
    def short_name(self):
        """
        Returns the short name (username) of the user.
        """
        return self.username
