from rest_framework import serializers
from common.firebase_admin_init import db

class ForumSerializer(serializers.Serializer):
    """
    Serializer for the Forum model.
    """

    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    course = serializers.CharField(max_length=100)
    module = serializers.CharField(max_length=100)
    created_at = serializers.DateTimeField()

    def create(self, validated_data):
        """
        Create a new forum document in Firestore.

        Args:
            validated_data (dict): Validated data for the new forum.

        Returns:
            dict: The created forum document as a dictionary.
        """
        ref = db.collection('forums').add(validated_data)
        document = db.collection('forums').document(ref[1].id).get()
        return document.to_dict()

    def update(self, instance, validated_data):
        """
        Update an existing forum document in Firestore.

        Args:
            instance (Forum): The existing forum instance.
            validated_data (dict): Validated data for the updated forum.

        Returns:
            dict: The updated forum document as a dictionary.
        """
        db.collection('forums').document(instance.id).update(validated_data)
        # Fetch the updated document to return
        updated_document = db.collection('forums').document(instance.id).get()
        return updated_document.to_dict()