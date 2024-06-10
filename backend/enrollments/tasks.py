# backend/tasks.py
from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from requests import request
from .models import Enrollment
from .utils import generate_certificate
from backend.enrollments.models import Enrollment


@shared_task
def send_enrollment_email(enrollment_id, subject, template_name):
    """
    Sends an email notification about an enrollment.
    """
    enrollment = Enrollment.objects.get(pk=enrollment_id)
    user = enrollment.student
    course = enrollment.course

    context = {
        'user': user,
        'course': course,
    }
    message = render_to_string(template_name, context)

    send_mail(
        subject,
        message,
        'your_email@example.com', 
        [user.email],
        fail_silently=False,
        html_message=message 
    )



@shared_task
def generate_certificate_task(enrollment_id):
    """
    Generates a certificate and sends an email notification.
    """
    enrollment = Enrollment.objects.get(pk=enrollment_id)
    if enrollment.completed:
        certificate_url = generate_certificate(enrollment)
        enrollment.certificate_url = certificate_url
        enrollment.save()

        # Send email notification
        subject = f"Your Certificate for {enrollment.course.title} is Ready!"
        context = {
            'user': enrollment.student,
            'course': enrollment.course,
            'certificate_url': request.build_absolute_uri(enrollment.certificate_url),
        }
        message = render_to_string('enrollment/certificate_ready_email.html', context)
        send_mail(
            subject,
            message,
            'your_email@example.com', # Replace with your email 
            [enrollment.student.email],
            fail_silently=False,
            html_message=message,
        )