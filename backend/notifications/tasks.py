from celery import shared_task
from pyfcm import FCMNotification
from django.conf import settings
from .firestore_service import FirestoreNotificationService
import logging
import sentry_sdk  # Import Sentry SDK

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize Sentry SDK
sentry_sdk.init(dsn="SENTRY_DSN")

@shared_task
def send_notification(user_id, notification_type, message):
    """
    Sends a notification to a user.

    Args:
        user_id (str): The ID of the user to send the notification to.
        notification_type (str): The type of notification to send.
        message (dict): The message content of the notification.

    Returns:
        None

    Raises:
        None
    """
    if not user_id or not notification_type or not message:
        logger.error("Invalid parameters for sending notification.")
        sentry_sdk.capture_message("Invalid parameters for sending notification.", level="error")
        return

    try:
        preferences = FirestoreNotificationService.get_user_preferences(user_id)
        if not preferences:
            logger.info(f"No preferences found for user {user_id}. Notification not sent.")
            return

        if not preferences.get('receive_notifications', True):
            logger.info(f"User {user_id} has opted out of receiving notifications.")
            return

        push_service = FCMNotification(service_account_file=settings.FCM_SERVICE_ACCOUNT_FILE, project_id=settings.FCM_PROJECT_ID)
        device_token = preferences.get('fcm_token')
        if notification_type == 'fcm' and device_token:
            notification_title = message.get('title')
            notification_body = message.get('body')
            data_payload = message.get('data', {})  # Optional data payload

            result = push_service.notify(
                fcm_token=device_token,
                notification_title=notification_title,
                notification_body=notification_body,
                data_payload=data_payload,
                # Additional parameters as needed
                dry_run=False,  # Example parameter
                timeout=120  # Example parameter
            )

            if result['success'] == 1:
                logger.info(f"FCM notification sent successfully to user {user_id}.")
            else:
                logger.warning(f"Failed to send FCM notification to user {user_id}: {result}")
                sentry_sdk.capture_message(f"Failed to send FCM notification to user {user_id}: {result}", level="warning")
        else:
            logger.warning(f"Notification type '{notification_type}' not supported or missing device token for user {user_id}.")
            sentry_sdk.capture_message(f"Notification type '{notification_type}' not supported or missing device token for user {user_id}.", level="warning")

    except Exception as e:
        logger.error(f"Exception occurred while sending notification to user {user_id}: {e}", exc_info=True)
        sentry_sdk.capture_exception(e)