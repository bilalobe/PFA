import logging
from rest_framework import serializers
from .models import Forum

logging = logging.getLogger(__name__)


class ForumSerializer(serializers.ModelSerializer):
    """
    Serializer class for the Forum model.

    Serializes the Forum model fields into JSON format.

    """
    class Meta:
        model = Forum
        fields = ['id', 'title', 'description', 'course', 'module', 'created_at']
