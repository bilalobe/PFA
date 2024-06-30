from celery import shared_task
from pyfcm import FCMNotification
from django.conf import settings
from .firestore_service import FirestoreNotificationService
import logging

# Initialize logger
logger = logging.getLogger(__name__)

@shared_task
def send_notification(user_id, notification_type, message):
    try:
        preferences = FirestoreNotificationService.get_user_preferences(user_id)

        if preferences and preferences.get('receive_notifications', True):
            # Initialize FCMNotification with the required parameters
            push_service = FCMNotification(service_account_file=settings.FCM_SERVICE_ACCOUNT_FILE, project_id=settings.FCM_PROJECT_ID)
            if notification_type == 'fcm':
                device_token = preferences.get('fcm_token')
                if device_token:
                    # Prepare notification parameters
                    notification_title = message.get('title')
                    notification_body = message.get('body')
                    data_payload = message.get('data', {})  # Optional data payload

                    # Send notification with optional data payload
                    result = push_service.notify()

                    if result['success'] == 1:
                        logger.info(f"FCM notification sent successfully to user {user_id}")
                    else:
                        logger.warning(f"Failed to send FCM notification to user {user_id}: {result}")

    except Exception as e:
        logger.error(f"Failed to send notification to user {user_id}: {e}")
