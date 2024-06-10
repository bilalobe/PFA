from django.contrib import admin
from .models import Forum, Thread, Post, Comment, Moderation

# ... other model registrations

@admin.register(Moderation)
class ModerationAdmin(admin.ModelAdmin):
    list_display = ('post', 'reason', 'reported_by', 'created_at', 'moderator', 'action_taken')
    list_filter = ('reason', 'action_taken', 'created_at')
    search_fields = ('post__content', 'reported_by__username')  # Allow searching by post content and reporter username
    readonly_fields = ('post', 'reason', 'reported_by', 'created_at') 

    def has_add_permission(self, request):
        return False  # Prevent adding moderation reports directly from the admin

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or (obj and obj.moderator == request.user)

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser