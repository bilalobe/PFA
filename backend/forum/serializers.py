from rest_framework import serializers
from .models import ForumPost, Comment

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_username', 'content', 'created_at', 'updated_at']

class ForumPostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = ForumPost
        fields = ['id', 'course', 'author', 'author_username', 'title', 'content', 'created_at', 'updated_at', 'comments']
