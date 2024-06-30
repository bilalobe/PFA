from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    custom_field = serializers.CharField(required=False)

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'custom_field', 'author', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']  # Example read-only fields

    def validate(self, data):
        """
        Perform object-level validation. This is where you can add validations that span multiple fields.
        """
        if 'custom_field' in data and not data['custom_field'].startswith('custom_'):
            raise serializers.ValidationError({"custom_field": "Custom field must start with 'custom_'."})
        return data

    def create(self, validated_data):
        """
        Custom logic for creating a new Post instance.
        """
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Custom logic for updating an existing Post instance.
        """
        validated_data.pop('author', None)
        return super().update(instance, validated_data)