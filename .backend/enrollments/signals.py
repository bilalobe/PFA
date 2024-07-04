from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Enrollment
from .tasks import send_welcome_email_task


@receiver(post_save, sender=Enrollment)
def send_welcome_email_signal(sender, instance, created, **kwargs):
    """
    Sends a welcome email to the student upon successful enrollment.
    """
    if created:
        send_welcome_email_task(
            instance.student.email, "Welcome to the Course!", "welcome_email_template"
        )


def enrollment_updated(sender, instance, **kwargs):
    """
    Handles post-save signal for Enrollment model.
    Updates related data or performs actions after an enrollment is saved.
    """
    pass
