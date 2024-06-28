import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from firebase_admin import auth, storage
from unittest.mock import patch
from backend.common.firebase_admin_init import db
from users.serializers import UserUpdateSerializer

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user(db):
    def _create_user(username, email, password):
        return User.objects.create_user(username=username, email=email, password=password)
    return _create_user

@pytest.fixture
def create_serializer_data():
    def _create_serializer_data(username, email, user_type, bio, profile_picture):
        return {
            'username': username,
            'email': email,
            'user_type': user_type,
            'bio': bio,
            'profile_picture': profile_picture
        }
    return _create_serializer_data

@pytest.mark.django_db
def test_user_update_success(api_client, create_user, create_serializer_data):
    user = create_user("testuser", "user@example.com", "password")
    api_client.force_authenticate(user=user)
    serializer_data = create_serializer_data(
        username="newusername",
        email="newemail@example.com",
        user_type="student",
        bio="New bio",
        profile_picture=None
    )
    serializer = UserUpdateSerializer(instance=user, data=serializer_data)
    assert serializer.is_valid()
    updated_data = serializer.update(user, serializer.validated_data)
    assert updated_data == serializer_data

@pytest.mark.django_db
def test_user_update_failure(api_client, create_user, create_serializer_data):
    user = create_user("testuser", "user@example.com", "password")
    api_client.force_authenticate(user=user)
    serializer_data = create_serializer_data(
        username="newusername",
        email="newemail@example.com",
        user_type="invalid",
        bio="New bio",
        profile_picture=None
    )
    serializer = UserUpdateSerializer(instance=user, data=serializer_data)
    assert not serializer.is_valid()
    assert 'user_type' in serializer.errors
    
@pytest.mark.django_db
def test_user_update_profile_picture(api_client, create_user, create_serializer_data):
    user = create_user("testuser", "user@example.com", "password")
    api_client.force_authenticate(user=user)
    serializer_data = create_serializer_data(
        username="newusername",
        email="newemail@example.com",
        user_type="student",
        bio="New bio",
        profile_picture="path/to/profile_picture.jpg"
    )
    with patch('firebase_admin.auth.update_user') as mock_update_user, \
         patch('backend.common.firebase_admin_init.storage.bucket') as mock_bucket, \
         patch('backend.common.firebase_admin_init.storage.blob') as mock_blob:
        mock_update_user.return_value = auth.UserRecord({"uid": "123", "email": "user@example.com"})
        mock_bucket.return_value = mock_bucket
        mock_blob.return_value = mock_blob
        mock_blob.public_url = "https://example.com/profile_picture.jpg"
        serializer = UserUpdateSerializer(instance=user, data=serializer_data)
        assert serializer.is_valid()
        updated_data = serializer.update(user, serializer.validated_data)
        assert updated_data == serializer_data
        mock_blob.upload_from_string.assert_called_once_with(
            serializer_data['profile_picture'].read(),
            content_type=serializer_data['profile_picture'].content_type
        )
        mock_blob.make_public.assert_called_once()
        assert updated_data['profile_picture_url'] == mock_blob.public_url