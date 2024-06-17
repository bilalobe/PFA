from django.db import models
from django.contrib.auth.models import User
from forums.models import Forum


class Thread(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name="threads")
    title = models.CharField(max_length=255)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="threads_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_closed = models.BooleanField(default=False)
    closed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="closed_threads",
    )
    closed_at = models.DateTimeField(null=True, blank=True)
    is_solved = models.BooleanField(default=False)
    solved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="solved_threads",
    )
    solved_at = models.DateTimeField(null=True, blank=True)
    is_pinned = models.BooleanField(default=False)
    pinned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pinned_threads",
    )
    pinned_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title
