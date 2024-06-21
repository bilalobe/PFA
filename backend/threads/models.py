from django.db import models
from backend.users.models import User
from forums.models import Forum


class Thread(models.Model):
    """
    Represents a thread in a forum.

    Attributes:
        forum (Forum): The forum to which the thread belongs.
        title (str): The title of the thread.
        created_by (User): The user who created the thread.
        created_at (datetime): The timestamp when the thread was created.
        is_closed (bool): Indicates whether the thread is closed or not.
        closed_by (User): The user who closed the thread.
        closed_at (datetime): The timestamp when the thread was closed.
        is_solved (bool): Indicates whether the thread is solved or not.
        solved_by (User): The user who solved the thread.
        solved_at (datetime): The timestamp when the thread was solved.
        is_pinned (bool): Indicates whether the thread is pinned or not.
        pinned_by (User): The user who pinned the thread.
        pinned_at (datetime): The timestamp when the thread was pinned.
    """

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
