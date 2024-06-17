# backend/threads/serializers.py
from rest_framework import serializers
from .models import Thread


class ThreadSerializer(serializers.ModelSerializer):
    created_by = serializers.CharField(source="created_by.username", read_only=True)
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = "__all__"

    def get_post_count(self, obj):
        return obj.posts.count()


class ThreadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thread
        fields = ["forum", "title"]
