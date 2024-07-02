import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .views import ForumViewSet

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user(db):
    return User.objects.create_user(username='testuser', password='testpass123')

@pytest.fixture
def mock_db():
    with patch('backend.forums.views.db') as mock:
        yield mock

@pytest.fixture
def mock_cache():
    with patch('backend.forums.views.cache') as mock:
        yield mock

def test_list_forums_empty_cache(api_client, user, mock_db, mock_cache):
    mock_cache.get.return_value = None
    mock_db.collection().get.return_value = []
    api_client.force_authenticate(user=user)
    response = api_client.get('/forums/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data == []
    mock_cache.set.assert_called_once()

def test_list_forums_with_cache(api_client, user, mock_cache):
    cached_forums = [{'id': '1', 'title': 'Test Forum', 'description': 'A test forum'}]
    mock_cache.get.return_value = cached_forums
    api_client.force_authenticate(user=user)
    response = api_client.get('/forums/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data == cached_forums

def test_retrieve_forum_success(api_client, user, mock_db):
    forum_data = {'title': 'Test Forum', 'description': 'A test forum'}
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = forum_data
    mock_db.collection().document().get.return_value = mock_doc
    api_client.force_authenticate(user=user)
    response = api_client.get('/forums/1/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['title'] == 'Test Forum'

def test_create_forum_success(api_client, user, mock_db):
    forum_data = {'title': 'New Forum', 'description': 'A new forum'}
    api_client.force_authenticate(user=user)
    response = api_client.post('/forums/', forum_data)
    assert response.status_code == status.HTTP_201_CREATED
    mock_db.collection().add.assert_called_once()

def test_update_forum_success(api_client, user, mock_db):
    updated_data = {'title': 'Updated Forum'}
    mock_db.collection().document().update.return_value = None
    api_client.force_authenticate(user=user)
    response = api_client.put('/forums/1/', updated_data)
    assert response.status_code == status.HTTP_200_OK
    mock_db.collection().document().update.assert_called_once()

def test_destroy_forum_success(api_client, user, mock_db):
    api_client.force_authenticate(user=user)
    response = api_client.delete('/forums/1/')
    assert response.status_code == status.HTTP_204_NO_CONTENT
    mock_db.collection().document().delete.assert_called_once()