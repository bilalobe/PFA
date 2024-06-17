from rest_framework import serializers
from .models import Forum, Thread, Post, Comment, UserForumPoints


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
    threads = ThreadSerializer(many=True, read_only=True)

    class Meta:
        model = Forum
        fields = ("id", "title", "course", "description", "created_at", "threads")


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = "__all__"


class UserForumPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserForumPoints
        fields = "__all__"
