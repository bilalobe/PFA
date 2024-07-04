from rest_framework import serializers
from common.firestore_mixins import TimestampMixin


class CommentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True) 
    post_id = serializers.CharField()
    author = serializers.CharField(max_length=255)
    content = serializers.CharField()
    created_at = TimestampMixin()