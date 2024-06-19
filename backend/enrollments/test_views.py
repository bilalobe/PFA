import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient
from .models import Enrollment, ModuleCompletion
from courses.models import Course, Module

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user():
    return User.objects.create_user(username='testuser', password='testpassword')

@pytest.fixture
def course():
    return Course.objects.create(title='Test Course')

@pytest.fixture
def module(course):
    return Module.objects.create(course=course, title='Test Module')

@pytest.fixture
def enrollment(user, course):
    return Enrollment.objects.create(student=user, course=course)

def test_get_enrollments(api_client, user, enrollment):
    api_client.force_authenticate(user=user)
    response = api_client.get('/enrollments/')
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['student'] == user.id
    assert response.data[0]['course'] == enrollment.course.id

def test_create_enrollment(api_client, user, course):
    api_client.force_authenticate(user=user)
    data = {'course': course.id}
    response = api_client.post('/enrollments/', data)
    assert response.status_code == status.HTTP_201_CREATED
    assert Enrollment.objects.filter(student=user, course=course).exists()

def test_create_enrollment_already_enrolled(api_client, user, course):
    api_client.force_authenticate(user=user)
    Enrollment.objects.create(student=user, course=course)
    data = {'course': course.id}
    response = api_client.post('/enrollments/', data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['detail'] == 'You are already enrolled in this course.'

def test_delete_enrollment(api_client, user, enrollment):
    api_client.force_authenticate(user=user)
    response = api_client.delete(f'/enrollments/{enrollment.id}/')
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Enrollment.objects.filter(id=enrollment.id).exists()

def test_delete_enrollment_unauthorized(api_client, user, enrollment):
    another_user = User.objects.create_user(username='anotheruser', password='testpassword')
    api_client.force_authenticate(user=another_user)
    response = api_client.delete(f'/enrollments/{enrollment.id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.data['detail'] == 'You are not authorized to unenroll from this course.'

def test_complete_module(api_client, user, enrollment, module):
    api_client.force_authenticate(user=user)
    data = {'module_id': module.id}
    response = api_client.post(f'/enrollments/{enrollment.id}/complete_module/', data)
    assert response.status_code == status.HTTP_201_CREATED
    assert ModuleCompletion.objects.filter(enrollment=enrollment, module=module).exists()
    assert enrollment.progress == 100
    assert enrollment.completed

def test_complete_module_invalid_module(api_client, user, enrollment):
    api_client.force_authenticate(user=user)
    data = {'module_id': 999}
    response = api_client.post(f'/enrollments/{enrollment.id}/complete_module/', data)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data['error'] == 'Module not found'

def test_complete_module_module_not_belong(api_client, user, enrollment, course):
    api_client.force_authenticate(user=user)
    module = Module.objects.create(course=course, title='Another Module')
    data = {'module_id': module.id}
    response = api_client.post(f'/enrollments/{enrollment.id}/complete_module/', data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['error'] == 'This module does not belong to this course'

def test_complete_module_duplicate_completion(api_client, user, enrollment, module):
    api_client.force_authenticate(user=user)
    ModuleCompletion.objects.create(enrollment=enrollment, module=module)
    data = {'module_id': module.id}
    response = api_client.post(f'/enrollments/{enrollment.id}/complete_module/', data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['detail'] == 'You have already completed this module.'
