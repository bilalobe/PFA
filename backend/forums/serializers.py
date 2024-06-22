from rest_framework import serializers
from .models import Forum, Thread, Post


class PostSerializer(serializers.ModelSerializer):
    sentiment = serializers.CharField(source="get_sentiment_display", read_only=True)
    language = serializers.CharField(read_only=True)

    class Meta:
        model = Post
        fields = "__all__"  # Include all fields including sentiment and language


class ThreadSerializer(serializers.ModelSerializer):
    created_by = serializers.CharField(source="created_by.username", read_only=True)
    posts = PostSerializer(many=True, read_only=True)

    class Meta:
        model = Thread
        fields = ("id", "title", "forum", "created_by", "created_at", "posts")


class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = ['id', 'title', 'description', 'course', 'module', 'created_at']
