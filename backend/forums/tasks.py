from celery import shared_task
from django.contrib.auth import get_user_model
from backend.common.firebase_admin_init import db
import logging
from google.cloud.firestore import SERVER_TIMESTAMP

# Initialize logger
logger = logging.getLogger(__name__)

@shared_task(bind=True)
def flag_post_for_moderation(self, post_id, reason="offensive"):
    """
    Flags a post for moderation asynchronously using Firestore.
    Prevents duplicate flags for the same reason.
    Logs errors and retries the task if it fails.
    """
    User = get_user_model()
    try:
        moderation_query = db.collection('moderation').where('post_id', '==', post_id).where('reason', '==', reason)
        existing_flags = list(moderation_query.stream())

        if existing_flags and not any(flag.to_dict() and flag.to_dict().get('action_taken') == 'none' for flag in existing_flags): # type: ignore
            User.objects.get_or_create(username="system", defaults={'password': 'system'})
            
            moderation_data = {
                'post_id': post_id,
                'reason': reason,
                'created_at': SERVER_TIMESTAMP,
                'action_taken': 'none',
            }
            db.collection('moderation').add(moderation_data)

    except Exception as e:
        logger.error(f"Error flagging post {post_id} for reason '{reason}': {str(e)}")
        self.retry(exc=e, countdown=60)
