# backend/forum/tasks.py
from asyncio.log import logger
from celery import shared_task 
from django.contrib.auth import get_user_model  
from .models import Moderation, Post 

@shared_task(bind=True) 
def flag_post_for_moderation(self, post_id, reason='offensive'): 
    """
    Flags a post for moderation asynchronously.
    Prevents duplicate flags for the same reason.
    Logs errors and retries the task if it fails.
    """
    User = get_user_model()
    try:
        post = Post.objects.get(pk=post_id)

        # Check if this post has been flagged before for the same reason
        existing_flag = Moderation.objects.filter(
            post=post,
            reason=reason,
            action_taken='none' 
        ).exists()

        if not existing_flag:
            # Get or create a system user for automated flags
            system_user, _ = User.objects.get_or_create(username='system') 
            Moderation.objects.create(
                post=post,
                reason=reason,
                reported_by=system_user, 
            )

    except Post.DoesNotExist:
        # Handle the case where the post doesn't exist
        self.retry(exc=Exception(f"Post with ID {post_id} not found."), countdown=60)  # Retry after 60 seconds

    except Exception as e:
        # Log the error and retry the task
        logger.error(f"Error flagging post {post_id}: {str(e)}")
        self.retry(exc=e, countdown=60) # Retry after 60 seconds