""" from django.db import models
from django.contrib.auth.models import User
from posts.models import Post
from google.cloud.firestore import Client


class Comment(models.Model):
    # Represents a comment made by a user on a post.

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author} commented on {self.post}"

            # Existing fields...
        
    def to_firestore_doc(self):
        {#}Converts the comment instance into a Firestore document format.
        return {
            "author": self.author.username,
            "post_id": self.post.id,
            "content": self.content,
            "created_at": self.created_at,
        }
"""