import logging
from rest_framework import serializers

logger = logging.getLogger(__name__)

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        fields = ("id", "post", "author", "author_username", "content", "created_at")
        read_only_fields = ("id", "author", "created_at")
