import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from rest_framework import status
from unittest.mock import patch
from firebase_admin import auth

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user(db):
    def _create_user(username, email, password):
        return User.objects.create_user(username=username, email=email, password=password)
    return _create_user

@pytest.mark.django_db
def test_user_creation_success(api_client):
    with patch('firebase_admin.auth.create_user') as mock_create_user:
        mock_create_user.return_value = auth.UserRecord({"uid": "123", "email": "user@example.com"})
        data = {"email": "user@example.com", "password": "secretPassword", "display_name": "John Doe"}
        response = api_client.post("/users/", data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data == {"uid": "123", "email": "user@example.com"}

@pytest.mark.django_db
def test_user_creation_failure(api_client):
    data = {"email": "invalid", "password": "short"}
    response = api_client.post("/users/", data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_user_retrieve_own_profile(api_client, create_user):
    user = create_user("testuser", "user@example.com", "password")
    api_client.force_authenticate(user=user)
    response = api_client.get(f"/users/{user.id}/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["email"] == "user@example.com"

@pytest.mark.django_db
def test_list_enrollments_unauthorized(api_client):
    response = api_client.get("/users/1/enrollments/")
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
def test_list_courses_unauthenticated(api_client):
    response = api_client.get("/users/1/courses/")
    assert response.status_code == status.HTTP_404_NOT_FOUND