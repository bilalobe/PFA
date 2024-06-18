import logging
import os
from django.conf import settings
from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch

logger = logging.getLogger(__name__)

def draw_certificate(c, enrollment, logo_path):
    """
    Draws the certificate content on the canvas.
    """
    course = enrollment.course
    user = enrollment.student

    # Certificate Title
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(letter[0] / 2, letter[1] - 1 * inch, "Certificate of Completion")

    # Course Title
    c.setFont("Helvetica", 18)
    c.drawCentredString(letter[0] / 2, letter[1] - 2 * inch, course.title)

    # Student Name
    c.setFont("Helvetica", 16)
    c.drawCentredString(letter[0] / 2, letter[1] - 3 * inch, f"Presented to {user.username}")

    # Issue Date
    c.setFont("Helvetica", 14)
    c.drawCentredString(letter[0] / 2, letter[1] - 4 * inch, f"Issued on: {enrollment.completed_at.strftime('%Y-%m-%d')}")

    # Instructor Signature
    c.setFont("Helvetica", 12)
    c.drawCentredString(letter[0] / 2, letter[1] - 5 * inch, "Instructor: John Doe")

    # Logo
    c.drawImage(logo_path, inch, inch, width=2 * inch, height=2 * inch)

def generate_certificate(enrollment):
    """
    Generates a PDF certificate for the given enrollment and saves the certificate's path to the database.
    """
    try:
        filename = f"certificate_{enrollment.id}.pdf"
        filepath = os.path.join(settings.MEDIA_ROOT, "certificates", filename)
        logo_path = os.path.join(settings.MEDIA_ROOT, "images", "logo.png")

        c = canvas.Canvas(filepath, pagesize=letter)
        try:
            draw_certificate(c, enrollment, logo_path)
        finally:
            c.save()
            c.showPage()
            c.save()
            c = None

        certificate_url = os.path.join("certificates", filename)
        enrollment.certificate = certificate_url
        enrollment.save()

        return certificate_url
    except Exception as e:
        logger.error(f"Error generating certificate for enrollment {enrollment.id}: {e}")
        return None

def send_email(enrollment, subject, template_name, attachments=None):
    """
    Sends an email with a specified template and optional attachments.
    """
    try:
        template_path = f"emails/{template_name}.html"
        message = render_to_string(template_path, {"enrollment": enrollment})
        email_from = settings.DEFAULT_FROM_EMAIL
        recipient_list = [enrollment.student.email]

        if attachments:
            # Assuming attachments is a list of file paths
            email = EmailMessage(
                subject,
                message,
                email_from,
                recipient_list
            )
            email.content_subtype = "html"
            for attachment in attachments:
                email.attach_file(attachment)
            email.send()
        else:
            send_mail(
                subject,
                message,
                email_from,
                recipient_list,
                fail_silently=False,
                html_message=message,
            )
    except Exception as e:
        logger.error(f"Error sending email for enrollment {enrollment.id}: {e}")

def trigger_follow_up_survey(enrollment):
    """
    Triggers a follow-up survey for the given enrollment.
    """
    # Code to trigger a follow-up survey
    pass
