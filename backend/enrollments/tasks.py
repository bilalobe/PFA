from celery import shared_task
from celery.utils.log import get_task_logger

from backend.enrollments.models import Enrollment
from backend.enrollments.utils import send_email, generate_certificate, trigger_follow_up_survey

logger = get_task_logger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_welcome_email_task(self, enrollment_id):
    """
    Asynchronously sends a welcome email to the student upon successful enrollment.
    """
    try:
        enrollment = Enrollment.objects.select_related('student').get(id=enrollment_id)
        send_email(enrollment.student.email, "Welcome to the Course!", "welcome_email")
        logger.info(f"Welcome email sent to {enrollment.student.email} for enrollment id {enrollment_id}.")
    except Enrollment.DoesNotExist:
        logger.error(f"Enrollment with id {enrollment_id} does not exist.")
    except Exception as exc:
        logger.error(f"Error sending welcome email for id {enrollment_id}: {exc}")
        self.retry(exc=exc)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_enrollment_email_task(self, enrollment_id):
    """
    Asynchronously sends an enrollment email.
    """
    try:
        enrollment = Enrollment.objects.select_related('student').get(id=enrollment_id)
        send_email(enrollment.student.email, "Enrollment Confirmation", "enrollment_confirmation")
        logger.info(f"Enrollment confirmation email sent to {enrollment.student.email} for enrollment id {enrollment_id}.")
    except Enrollment.DoesNotExist:
        logger.error(f"Enrollment with id {enrollment_id} does not exist.")
    except Exception as exc:
        logger.error(f"Error sending enrollment email for id {enrollment_id}: {exc}")
        self.retry(exc=exc)

@shared_task
def send_progress_update_email_task(enrollment_id):
    """
    Asynchronously sends a progress update email.
    """
    try:
        enrollment = Enrollment.objects.select_related('student').get(id=enrollment_id)
        send_email(enrollment.student.email, "Your Course Progress Update", "progress_update")
        logger.info(f"Progress update email sent to {enrollment.student.email} for enrollment id {enrollment_id}.")
    except Enrollment.DoesNotExist:
        logger.error(f"Enrollment with id {enrollment_id} does not exist.")

@shared_task
def send_completion_email_task(enrollment_id):
    """
    Asynchronously sends a course completion email and generates a certificate.
    """
    try:
        enrollment = Enrollment.objects.select_related('student').get(id=enrollment_id)
        if enrollment.completed:
            certificate_path = generate_certificate(enrollment)
            send_email(enrollment.student.email, "Course Completion", "course_completion", attachments=[certificate_path])
            trigger_follow_up_survey(enrollment)
            logger.info(f"Completion email and certificate sent to {enrollment.student.email} for enrollment id {enrollment_id}.")
    except Enrollment.DoesNotExist:
        logger.error(f"Enrollment with id {enrollment_id} does not exist.")