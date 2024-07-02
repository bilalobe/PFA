from rest_framework import serializers
from common.firebase_admin_init import db
from google.cloud import firestore

db = firestore.Client()

class PostSerializer(serializers.Serializer):
    """
    Serializer class for the Post model.
    """

    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=200)
    content = serializers.CharField()
    custom_field = serializers.CharField(required=False)
    author = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def validate(self, data):
        if 'custom_field' in data and not data['custom_field'].startswith('custom_'):
            raise serializers.ValidationError({"custom_field": "Custom field must start with 'custom_'."})
        return data

    def create(self, validated_data):
        ref = db.collection('posts').document()
        validated_data['id'] = ref.id
        validated_data['created_at'] = firestore.SERVER_TIMESTAMP
        validated_data['updated_at'] = firestore.SERVER_TIMESTAMP
        # Set the author based on the request context
        validated_data['author'] = self.context['request'].user.username
        ref.set(validated_data)
        return validated_data

    def update(self, instance, validated_data):
        validated_data['updated_at'] = firestore.SERVER_TIMESTAMP
        db.collection('posts').document(instance['id']).update(validated_data)
        return validated_data
