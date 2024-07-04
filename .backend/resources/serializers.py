import logging
from rest_framework import serializers
from .models import Resource

logger = logging.getLogger(__name__)

class ResourceSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.CharField(source="uploaded_by.username", read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_kb = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = (
            "id",
            "module",
            "uploaded_by",
            "title",
            "description",
            "file",
            "file_url",
            "file_type",
            "file_size",
            "file_size_kb",
            "upload_date",
            "download_count",
        )
        read_only_fields = (
            "uploaded_by",
            "file_url",
            "file_type",
            "file_size",
            "file_size_kb",
            "upload_date",
            "download_count",
        )

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.file.url) if request else None
        return None

    def get_file_size_kb(self, obj):
        return obj.file_size / 1024 if obj.file_size else 0
