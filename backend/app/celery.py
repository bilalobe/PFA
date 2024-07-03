from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dj_ango.settings")

app = Celery(
    "dj_ango", broker="redis://localhost:6379/0"
)  # Fix: Provide the broker URL for Celery to connect to Redis
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


# Example task (backend/tasks.py)
@app.task(bind=True)
def send_email_notification(self, subject, message, recipient_list):
    from django.core.mail import send_mail

    send_mail(subject, message, "from@example.com", recipient_list)
