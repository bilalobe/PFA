import pytest
from rest_framework.test import APIClient
from django.urls import reverse

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_correct_text_with_text(api_client):
    response = api_client.post(reverse('correct_text'), {'text': 'I havv spellin mistaks.'}, format='json')
    assert response.status_code == 200
    assert 'corrected_text' in response.data

@pytest.mark.django_db
def test_correct_text_without_text(api_client):
    response = api_client.post(reverse('correct_text'), {}, format='json')
    assert response.status_code == 400
    assert 'error' in response.data

@pytest.mark.django_db
def test_summarize_text_with_text(api_client):
    response = api_client.post(reverse('summarize_text'), {'text': 'This is a long text needing summarization.'}, format='json')
    assert response.status_code == 200
    assert 'summary' in response.data

@pytest.mark.django_db
def test_summarize_text_without_text(api_client):
    response = api_client.post(reverse('summarize_text'), {}, format='json')
    assert response.status_code == 400
    assert 'error' in response.data

@pytest.mark.django_db
def test_generate_questions_with_text(api_client):
    response = api_client.post(reverse('generate_questions'), {'text': 'This text should generate some questions.'}, format='json')
    assert response.status_code == 200
    assert 'questions' in response.data

@pytest.mark.django_db
def test_generate_questions_without_text(api_client):
    response = api_client.post(reverse('generate_questions'), {}, format='json')
    assert response.status_code == 400
    assert 'error' in response.data