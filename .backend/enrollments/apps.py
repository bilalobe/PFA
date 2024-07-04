from django.apps import AppConfig
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Enrollment


class EnrollmentConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.enrollments"

    def ready(self):
        # No need to import signals explicitly
        # The @receiver decorator ensures the signal is connected
        pass


@receiver(post_save, sender=Enrollment)
def enrollment_updated(sender, instance, **kwargs):
    """
    Handles post-save signal for Enrollment model.
    Updates related data or performs actions after an enrollment is saved.
    """
    pass
