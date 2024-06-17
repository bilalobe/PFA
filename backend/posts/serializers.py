# backend/posts/serializers.py
from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.username", read_only=True)
    sentiment = serializers.CharField(source="get_sentiment_display", read_only=True)
    language = serializers.CharField(read_only=True)

    class Meta:
        model = Post
        fields = "__all__"
