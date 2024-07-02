import pytest
from unittest import mock
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User

# Fixtures for mock data
@pytest.fixture
def mock_chat_room_data():
    return {
        'id': 'test_chat_room_id',
        'name': 'Test Chat Room',
        'chat_type': 'private',
        'users': ['test_user_id'],
    }

@pytest.fixture
def mock_chat_message_data():
    return {
        'id': 'test_message_id',
        'sender': 'test_user',
        'message': 'Test message',
        'timestamp': '2023-06-30T12:00:00Z',
    }

@pytest.fixture
def api_client():
    user = User.objects.create_user(username='testuser', password='testpassword')
    client = APIClient()
    client.login(username='testuser', password='testpassword')
    return client

# Test cases
def test_chat_rooms_list(api_client):
    with mock.patch('backend.chat.views.db.collection') as mock_db:
        mock_db.return_value.get.return_value = [mock.Mock(id='1', to_dict=lambda: {'name': 'Room 1'}),
                                                 mock.Mock(id='2', to_dict=lambda: {'name': 'Room 2'})]

        response = api_client.get('/api/chat_rooms/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        assert response.data[0]['name'] == 'Room 1'
        assert response.data[1]['name'] == 'Room 2'

def test_chat_room_detail(api_client, mock_chat_room_data):
    with mock.patch('backend.chat.views.db.collection') as mock_db:
        mock_db.return_value.document.return_value.get.return_value.to_dict.return_value = mock_chat_room_data

        response = api_client.get(f'/api/chat_rooms/{mock_chat_room_data["id"]}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == mock_chat_room_data['name']

def test_chat_room_update(api_client, mock_chat_room_data):
    updated_data = {'name': 'Updated Chat Room'}
    with mock.patch('backend.chat.views.db.collection') as mock_db:
        mock_db.return_value.document.return_value.update.return_value = None

        response = api_client.post(f'/api/chat_rooms/{mock_chat_room_data["id"]}/', updated_data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == updated_data['name']

def test_chat_room_deletion(api_client, mock_chat_room_data):
    with mock.patch('backend.chat.views.db.collection') as mock_db:
        mock_db.return_value.document.return_value.delete.return_value = None

        response = api_client.delete(f'/api/chat_rooms/{mock_chat_room_data["id"]}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT

def test_chat_messages_retrieval(api_client, mock_chat_message_data):
    with mock.patch('backend.chat.views.db.collection') as mock_db:
        mock_db.return_value.document.return_value.collection.return_value.order_by.return_value.limit.return_value.stream.return_value = [
            mock.Mock(to_dict=lambda: mock_chat_message_data)]

        response = api_client.get(f'/api/chat_rooms/{mock_chat_message_data["id"]}/messages/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]['message'] == mock_chat_message_data['message']

def test_send_chat_message(api_client, mock_chat_message_data):
    with mock.patch('backend.chat.views.db.collection') as mock_db:
        mock_db.return_value.document.return_value.collection.return_value.add.return_value = (None, mock.Mock(id='new_message_id'))

        response = api_client.post(f'/api/chat_rooms/{mock_chat_message_data["id"]}/messages/', mock_chat_message_data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['message'] == mock_chat_message_data['message']

def test_send_typing_notification(api_client, mock_chat_room_data):
    typing_data = {'is_typing': True}
    with mock.patch('backend.chat.views.get_chat_room') as mock_get_chat_room:
        mock_get_chat_room.return_value = mock_chat_room_data

        response = api_client.post(f'/api/chat_rooms/{mock_chat_room_data["id"]}/typing/', typing_data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'ok'
