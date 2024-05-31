from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field is required.'))
        user = self.model(username=username, email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        user = self.create_user(username, email, password, **extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class Utilisateur(AbstractBaseUser, models.Model):

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
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    role = models.CharField(max_length=50, choices=(('apprenant', 'Apprenant'), ('formateur', 'Formateur')))
    niveau_competence = models.CharField(max_length=50, blank=True, null=True)  # Spécifique apprenant
    domaine_expertise = models.CharField(max_length=50, blank=True, null=True)  # Spécifique formateur

    USERNAME_FIELD = 'email'  # Utiliser l'email comme nom d'utilisateur
    REQUIRED_FIELDS = ['username', 'email', 'password']

    objects = UserManager()

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

