from rest_framework import serializers
from .models import Forum, Thread, Post

class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)
    created_at = serializers.DateTimeField(read_only=True)  # Removed the format string

    class Meta:
        model = Post
        fields = ('id', 'author', 'content', 'created_at')

class ThreadSerializer(serializers.ModelSerializer):
    created_by = serializers.CharField(source='created_by.username', read_only=True)
    posts = PostSerializer(many=True, read_only=True)

    class Meta:
        model = Thread
        fields = ('id', 'title', 'forum', 'created_by', 'created_at', 'posts')
         
class ForumSerializer(serializers.ModelSerializer):
    threads = ThreadSerializer(many=True, read_only=True)

    class Meta:
        model = Forum
        fields = ('id', 'title', 'course', 'description', 'created_at', 'threads')
