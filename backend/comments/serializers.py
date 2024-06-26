from rest_framework import serializers
from .models import Comment  # Ensure this import points to the correct Comment model


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Comment
        fields = ("id", "post", "author", "author_username", "content", "created_at")
        read_only_fields = ("id", "author", "created_at")
