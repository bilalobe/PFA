import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_data():
    return {
        "username": "testuser",
        "password": "password123",
        "email": "test@example.com",
    }


@pytest.fixture
def valid_login_data(user_data):
    return {"username": user_data["username"], "password": user_data["password"]}


def test_api_root(api_client):
    response = api_client.get(reverse("api_root"))
    assert response.status_code == status.HTTP_200_OK
    # Further checks can be added to validate the content of the response


def test_registration_success(api_client, user_data):
    response = api_client.post(reverse("registration_view"), data=user_data)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["message"] == "User registered successfully."


def test_registration_existing_username(api_client, user_data):
    User.objects.create_user(**user_data)
    response = api_client.post(reverse("registration_view"), data=user_data)
    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.data["error"] == "A user with that username already exists."


def test_registration_invalid_data(api_client):
    response = api_client.post(reverse("registration_view"), data={})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    # Assert on the error message if specific validation messages are expected


def test_login_success(api_client, user_data, valid_login_data):
    User.objects.create_user(**user_data)
    response = api_client.post(reverse("login_view"), data=valid_login_data)
    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data and "refresh" in response.data


def test_login_invalid_credentials(api_client, valid_login_data):
    valid_login_data["password"] = "wrongpassword"
    response = api_client.post(reverse("login_view"), data=valid_login_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    # Assert on the error message if specific validation messages are expected
