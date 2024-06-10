# backend/forum/tasks.py 
from celery import shared_task
from .models import Moderation, Post, User

@shared_task
def flag_post_for_moderation(post_id):
    post = Post.objects.get(pk=post_id)
    # Check if this post has been flagged before for the same reason
    existing_flag = Moderation.objects.filter(
        post=post,
        reason='offensive',  # Or your specific reason 
        action_taken='none'
    ).exists()

    if not existing_flag: 
        Moderation.objects.create(
            post=post,
            reason='offensive', 
            reported_by=User.objects.get(username='system'), # Or another way to identify the automated system
        )