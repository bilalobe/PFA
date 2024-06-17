from django.contrib import admin
from django.shortcuts import redirect, render
from django.utils.html import format_html
from django.urls import reverse
from ..forums.models import Forum, Thread, Post, Comment, Moderation
from django.utils import timezone


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
        """
        Creates a clickable link to the reported post in the admin.
        """
        url = reverse("admin:forum_post_change", args=(obj.post.id,))
        return format_html("")

    def has_add_permission(self, request):
        """
        Prevents adding moderation reports directly from the admin.
        """
        return False

    def has_change_permission(self, request, obj=None):
        """
        Allows superusers or the assigned moderator to change a report.
        """
        return request.user.is_superuser or (obj and obj.moderator == request.user)

    def has_delete_permission(self, request, obj=None):
        """
        Only allows superusers to delete moderation reports.
        """
        return request.user.is_superuser

    @admin.action(description="Take Moderation Action")
    def take_action(self, request, queryset):
        """
        Custom admin action to take moderation actions on selected reports.
        """
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

                # Additional logic for warning or banning users (example):
                if action_taken in ["warn", "ban"]:
                    user = moderation.post.author
                    # ... implement your logic to warn or ban the user ...

            self.message_user(
                request, f"Action taken on {queryset.count()} moderation reports."
            )
            return redirect(
                "admin:forum_moderation_changelist"
            )  # Redirect to the moderation list

        return render(
            request,
            "admin/forum/moderation/take_action.html",
            context={"moderations": queryset},
        )
