import pytest
from rest_framework import status
from unittest.mock import Mock

# Define custom mock classes as needed
class MockExists:
    def exists(self):
        return True

class MockNotExists:
    def exists(self):
        return False

class MockDocument:
    def to_dict(self):
        return {'id': '1', 'text': 'Sample comment'}

class MockDocumentReference:
    def __init__(self, id=None):
        self.id = id

@pytest.mark.django_db
def test_retrieve_comment_success(api_client, mocker):
    mocker.patch('firebase_admin.firestore.client.collection.document.get', return_value=MockExists())
    response = api_client.get("/comments/1/")
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_retrieve_comment_not_found(api_client, mocker):
    mocker.patch('firebase_admin.firestore.client.collection.document.get', return_value=MockNotExists())
    response = api_client.get("/comments/1/")
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
def test_retrieve_comment_server_error(api_client, mocker):
    mocker.patch('firebase_admin.firestore.client.collection.document.get', side_effect=Exception('Server error'))
    response = api_client.get("/comments/1/")
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

# Test List Comments
@pytest.mark.django_db
def test_list_comments_success(api_client, mocker):
    mocker.patch('firebase_admin.firestore.client.collection.where.get', return_value=[MockDocument()])
    response = api_client.get("/comments/", {'post_id': 'post1'})
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_list_comments_post_id_required(api_client):
    response = api_client.get("/comments/")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_list_comments_server_error(api_client, mocker):
    mocker.patch('firebase_admin.firestore.client.collection.where.get', side_effect=Exception('Server error'))
    response = api_client.get("/comments/", {'post_id': 'post1'})
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

# Test Create Comment
@pytest.mark.django_db
def test_create_comment_success(api_client, mocker, authenticated_user):
    mocker.patch('firebase_admin.firestore.client.collection.add', return_value=(MockDocumentReference(), None))
    api_client.force_authenticate(user=authenticated_user)
    response = api_client.post("/comments/", {'post_id': 'post1', 'text': 'Test comment'})
    assert response.status_code == status.HTTP_201_CREATED

@pytest.mark.django_db
def test_create_comment_post_id_required(api_client, authenticated_user):
    api_client.force_authenticate(user=authenticated_user)
    response = api_client.post("/comments/", {'text': 'Test comment'})
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_create_comment_validation_error(api_client, authenticated_user):
    api_client.force_authenticate(user=authenticated_user)
    response = api_client.post("/comments/", {'post_id': 'post1'})
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_create_comment_server_error(api_client, mocker, authenticated_user):
    mocker.patch('firebase_admin.firestore.client.collection.add', side_effect=Exception('Server error'))
    api_client.force_authenticate(user=authenticated_user)
    response = api_client.post("/comments/", {'post_id': 'post1', 'text': 'Test comment'})
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

# Test Update Comment
@pytest.mark.django_db
def test_update_comment_success(api_client, mocker, authenticated_user):
    mocker.patch('firebase_admin.firestore.client.collection.document.update', return_value=None)
    api_client.force_authenticate(user=authenticated_user)
    response = api_client.put("/comments/1/", {'text': 'Updated comment'})
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_update_comment_validation_error(api_client, authenticated_user):
    api_client.force_authenticate(user=authenticated_user)
    response = api_client.put("/comments/1/", {})
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_update_comment_server_error(api_client, mocker, authenticated_user):
    mocker.patch('firebase_admin.firestore.client.collection.document.update', side_effect=Exception('Server error'))
    api_client.force_authenticate(user=authenticated_user)
    response = api_client.put("/comments/1/", {'text': 'Updated comment'})
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

# Test Destroy Comment
@pytest.mark.django_db
def test_destroy_comment_success(api_client, mocker):
    mocker.patch('firebase_admin.firestore.client.collection.document.delete', return_value=None)
    response = api_client.delete("/comments/1/")
    assert response.status_code == status.HTTP_204_NO_CONTENT

@pytest.mark.django_db
def test_destroy_comment_server_error(api_client, mocker):
    mocker.patch('firebase_admin.firestore.client.collection.document.delete', side_effect=Exception('Server error'))
    response = api_client.delete("/comments/1/")
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR