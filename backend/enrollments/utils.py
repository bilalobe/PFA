from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch 
from django.conf import settings 
import os 
from django.core.mail import send_mail
from django.template.loader import render_to_string

def generate_certificate(enrollment):
    """
    Generates a PDF certificate for the given enrollment.
    """
    course = enrollment.course
    user = enrollment.student

    # Create a canvas object
    filename = f'certificate_{enrollment.id}.pdf'
    filepath = os.path.join(settings.MEDIA_ROOT, 'certificates', filename)
    c = canvas.Canvas(filepath, pagesize=letter)

    # Certificate Title
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(letter[0] / 2, letter[1] - 1 * inch, "Certificate of Completion")

    # Course Title
    c.setFont("Helvetica", 18)
    c.drawCentredString(letter[0] / 2, letter[1] - 2 * inch, f"{course.title}")

    # Student Name
    c.setFont("Helvetica", 16)
    c.drawCentredString(letter[0] / 2, letter[1] - 3 * inch, f"Presented to {user.username}")

    # Issue Date
    c.setFont("Helvetica", 14)
    c.drawCentredString(letter[0] / 2, letter[1] - 4 * inch, f"Issued on: {enrollment.completed_at.strftime('%Y-%m-%d')}")

    # You can add more elements: instructor signature, logo, etc. 

    c.save()

    # Return the relative URL of the certificate
    return os.path.join('certificates', filename)  # Return the relative URL of the certificate

