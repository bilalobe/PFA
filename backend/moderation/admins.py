from django.contrib import admin
from django.shortcuts import redirect, render
from django.utils.html import format_html
from django.utils import timezone
from firebase_admin import firestore
from django.contrib import messages

from backend.moderation.utils import send_moderation_notification

# Initialize Firestore client once
db = firestore.client()

class ModerationAdmin:
    display_fields = ["post_link", "reason", "reported_by", "created_at", "moderator", "action_taken", "action_taken_at"]

    def __init__(self):
        self.moderations = self.fetch_moderations()

    def fetch_moderations(self):
        moderations_ref = db.collection('moderations')
        docs = moderations_ref.stream()
        moderations = []
        for doc in docs:
            moderation = doc.to_dict()
            if moderation:  # Simplified check for None
                moderation['id'] = doc.id
                moderations.append(moderation)
            else:
                print(f"Warning: Document {doc.id} returned None.")
        return moderations

    def post_link(self, moderation):
        post_id = moderation.get('post_id')
        url = f"/admin/forum_post_change/{post_id}"
        return format_html('<a href="{}">View Post</a>', url)

@admin.action(description="Take Moderation Action")
def take_action(self, request, queryset):
    if "apply" in request.POST:
        action_taken = request.POST["action_taken"]
        action_description = request.POST["action_description"]

        for moderation in queryset:
            # Update moderation details
            moderation_ref = db.collection('moderations').document(str(moderation.id))
            moderation_update = {
                "moderator": request.user.username,
                "action_taken": action_taken,
                "action_description": action_description,
                "action_taken_at": timezone.now(),
            }
            moderation_ref.update(moderation_update)

            # Handle post actions
            post_ref = db.collection('posts').document(str(moderation.post.id))
            if action_taken == "delete":
                post_ref.delete()
            elif action_taken in ["warn", "ban"]:
                send_moderation_notification(moderation.post.author, action_taken)

        messages.success(request, f"Action taken on {queryset.count()} moderation reports.")
        return redirect("admin:forum_moderation_changelist")

    return render(request, "admin/forum/moderation/take_action.html", context={"moderations": queryset})
