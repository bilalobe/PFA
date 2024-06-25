from django.contrib import admin
from django.contrib.auth import get_user_model
from django.shortcuts import redirect, render
from django.utils.html import format_html
from django.urls import reverse
from .models import Moderation
from django.utils import timezone
from firebase_admin import messaging

@admin.register(Moderation)
class ModerationAdmin(admin.ModelAdmin):
    list_display = (
        "post_link",
        "reason",
        "reported_by",
        "created_at",
        "moderator",
        "action_taken",
        "action_taken_at",
    )
    list_filter = ("reason", "action_taken", "created_at")
    search_fields = ("post__content", "reported_by__username")
    readonly_fields = ("post_link", "reason", "reported_by", "created_at")
    actions = ["take_action"]

    def post_link(self, obj):
        url = reverse("admin:forum_post_change", args=(obj.post.id,))
        return format_html('<a href="{}">View Post</a>', url)

    def has_add_permission(self, request):
        return False


    def has_change_permission(self, request, obj=None):
        # Fetch the user model to ensure compatibility with custom user models
        User = get_user_model()
        user = request.user

        # Check if the user model has the 'is_superuser' attribute
        if hasattr(User, 'is_superuser'):
            if user.is_superuser:
                return True
        elif obj and hasattr(obj, 'moderator'):
            return obj.moderator == user
        return False

    def has_delete_permission(self, request, obj=None):
        # Fetch the user model to ensure compatibility with custom user models
        User = get_user_model()
        user = request.user

        if hasattr(User, 'is_superuser'):
            return user.is_superuser
        return False

    @admin.action(description="Take Moderation Action")
    def take_action(self, request, queryset):
        if "apply" in request.POST:
            action_taken = request.POST["action_taken"]
            action_description = request.POST["action_description"]

            for moderation in queryset:
                moderation.moderator = request.user
                moderation.action_taken = action_taken
                moderation.action_description = action_description
                moderation.action_taken_at = timezone.now()
                moderation.save()

                if action_taken == "delete":
                    moderation.post.delete()

                # Example logic for warning or banning users
                if action_taken in ["warn", "ban"]:
                    user = moderation.post.author
                    # Implement logic to warn or ban the user
                    # Example: Send Firebase notification to the user
                    message = messaging.Message(
                        notification=messaging.Notification(
                            title="Moderation Action",
                            body=f"You have been {action_taken} for violating the rules."
                        ),
                        token=user.firebase_token,
                    )
                    response = messaging.send(message)
                    print(f"Firebase notification sent: {response}")

            self.message_user(request, f"Action taken on {queryset.count()} moderation reports.")
            return redirect("admin:forum_moderation_changelist")

        return render(request, "admin/forum/moderation/take_action.html", context={"moderations": queryset})