import logging
from rest_framework import serializers
from .models import User
from firebase_admin import auth, storage
from backend.common.firebase_admin_init import db
from google.cloud.firestore import DocumentReference

logger = logging.getLogger(__name__)

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for listing users, showing basic information.
    """
    class Meta:
        model = User
        fields = ("id", "username", "email", "user_type", "bio", "profile_picture")

class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving a user's details, including enrollments and additional Firestore data.
    """
    enrollments = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    additional_info = serializers.SerializerMethodField()

    def get_additional_info(self, obj):
        try:
            doc_ref = db.collection('users').document(obj.firebase_uid)
            doc = doc_ref.get()
            return doc.to_dict() if doc.exists else {}
        except Exception as e:
            logger.error(f"Error retrieving additional info from Firestore: {e}")
            return {}

    class Meta:
        model = User
        fields = "__all__"

class UserCreateSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=[('student', 'Student'), ('teacher', 'Teacher')])

    def create(self, validated_data):
        try:
            user_record = auth.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                display_name=validated_data['username']
            )
            doc_ref = db.collection('users').document(user_record.uid)
            doc_ref.set({'user_type': validated_data['user_type']})
            return {'firebase_uid': user_record.uid, **validated_data}
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise serializers.ValidationError({"firebase": str(e)})

class UserUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating user information.

    This serializer is used to update user information in the database and Firebase authentication.

    Attributes:
        username (CharField): The username of the user. Optional.
        email (EmailField): The email address of the user. Optional.
        user_type (ChoiceField): The type of user (student or teacher). Optional.
        bio (CharField): The bio of the user. Optional.
        profile_picture (ImageField): The profile picture of the user. Optional.

    Methods:
        update(instance, validated_data): Updates the user information in the database and Firebase authentication.

    Raises:
        serializers.ValidationError: If there is an error updating the user information.

    """

    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    user_type = serializers.ChoiceField(choices=[('student', 'Student'), ('teacher', 'Teacher')], required=False)
    bio = serializers.CharField(required=False)
    profile_picture = serializers.ImageField(required=False)

    def update(self, instance, validated_data):
        """
        Updates the user information in the database and Firebase authentication.

        Args:
            instance: The instance of the user to be updated.
            validated_data: The validated data containing the updated user information.

        Returns:
            dict: The validated data containing the updated user information.

        Raises:
            serializers.ValidationError: If there is an error updating the user information.

        """
        try:
            user = auth.update_user(
                instance.firebase_uid,
                email=validated_data.get('email', None),
                display_name=validated_data.get('username', None)
            )
            doc_ref = db.collection('users').document(instance.firebase_uid)
            update_data = {k: v for k, v in validated_data.items() if k != 'profile_picture'}
            if 'profile_picture' in validated_data:
                picture = validated_data['profile_picture']
                bucket = storage.bucket()
                blob = bucket.blob(f'user_profiles/{instance.firebase_uid}/profile_picture')
                blob.upload_from_string(picture.read(), content_type=picture.content_type)
                blob.make_public()
                update_data['profile_picture_url'] = blob.public_url
            doc_ref.update(update_data)
            return validated_data
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            raise serializers.ValidationError({"firebase": str(e)})