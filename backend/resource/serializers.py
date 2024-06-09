from rest_framework import serializers
from .models import Resource

class ResourceSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.CharField(source='uploaded_by.username', read_only=True)  # Get the uploader's username

    class Meta:
        model = Resource
        fields = ('id', 'module', 'title', 'description', 'file', 'upload_date', 'uploaded_by')
        