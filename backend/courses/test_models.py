import pytest
from django.contrib.auth.models import User
from courses.models import Course, Module

@pytest.fixture
def user():
    return User.objects.create_user(username='testuser', password='testpassword')

@pytest.fixture
def course(user):
    return Course.objects.create(title='Test Course', instructor=user)

def test_module_creation(course):
    module = Module.objects.create(course=course, title='Test Module', order=1)
    assert module.title == 'Test Module'
    assert module.order == 1
    assert module.course == course

def test_module_str_representation(course):
    module = Module.objects.create(course=course, title='Test Module', order=1)
    assert str(module) == 'Test Module'

def test_module_unique_order(course):
    Module.objects.create(course=course, title='Module 1', order=1)
    with pytest.raises(Exception):
        Module.objects.create(course=course, title='Module 2', order=1)

def test_module_quizzes(course):
    module = Module.objects.create(course=course, title='Test Module', order=1)
    assert module.quizzes.count() == 0

def test_module_content(course):
    module = Module.objects.create(course=course, title='Test Module', order=1, content='Module content')
    assert module.content == 'Module content'

def test_module_created_by(course, user):
    module = Module.objects.create(course=course, title='Test Module', order=1, created_by=user)
    assert module.created_by == userimport pytest
from django.contrib.auth.models import User
from django.utils import timezone
from threads.models import Thread
from backend.posts.models import Post

@pytest.fixture
def user():
    return User.objects.create_user(username='testuser', password='testpassword')

@pytest.fixture
def thread(user):
    return Thread.objects.create(title='Test Thread', creator=user)

@pytest.fixture
def post(user, thread):
    return Post.objects.create(thread=thread, author=user, content='Test content')

def test_post_creation(post):
    assert post.thread.title == 'Test Thread'
    assert post.author.username == 'testuser'
    assert post.content == 'Test content'
    assert post.sentiment == 'neutral'
    assert post.polarity == 0
    assert post.language == ''

def test_post_str_representation(post):
    assert str(post) == 'testuser - Test content...'

def test_post_save(post):
    post.save()
    assert post.sentiment != ''
    assert post.language != ''

def test_post_analyze_sentiment(post):
    post.content = 'I love this!'
    assert post.analyze_sentiment() == 'positive'

def test_post_detect_language(post):
    post.content = 'Hola, cómo estás?'
    assert post.detect_language() == 'es'

def test_post_correct_spelling(post):
    post.content = 'I lve this!'
    corrected_text = post.correct_spelling()
    assert corrected_text == 'I love this!'import pytest
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from courses.models import Course, Module
from backend.resources.models import Resource

@pytest.fixture
def user():
    return User.objects.create_user(username='testuser', password='testpassword')

@pytest.fixture
def course(user):
    return Course.objects.create(title='Test Course', instructor=user)

@pytest.fixture
def module(course):
    return Module.objects.create(course=course, title='Test Module', order=1)

@pytest.fixture
def resource(user, module):
    file = SimpleUploadedFile("test_file.txt", b"file_content")
    return Resource.objects.create(module=module, uploaded_by=user, title='Test Resource', file=file)

def test_resource_creation(resource):
    assert resource.module.title == 'Test Module'
    assert resource.uploaded_by.username == 'testuser'
    assert resource.title == 'Test Resource'
    assert str(resource.file) == 'uploads/course_1/module_1/test_file.txt'
    assert resource.file_type == 'text/plain'
    assert resource.file_size == 12
    assert resource.thumbnail is None

def test_resource_str_representation(resource):
    assert str(resource) == 'Test Resource'

def test_resource_save(resource):
    resource.save()
    assert resource.file_size == resource.file.size
    assert resource.file_type == resource.file.file.content_typeimport pytest
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from courses.models import Course, Module
from backend.resources.models import Resource

@pytest.fixture
def user():
    return User.objects.create_user(username='testuser', password='testpassword')

@pytest.fixture
def course(user):
    return Course.objects.create(title='Test Course', instructor=user)

@pytest.fixture
def module(course):
    return Module.objects.create(course=course, title='Test Module', order=1)

@pytest.fixture
def resource(user, module):
    file = SimpleUploadedFile("test_file.txt", b"file_content")
    return Resource.objects.create(module=module, uploaded_by=user, title='Test Resource', file=file)

def test_resource_creation(resource):
    assert resource.module.title == 'Test Module'
    assert resource.uploaded_by.username == 'testuser'
    assert resource.title == 'Test Resource'
    assert str(resource.file) == 'uploads/course_1/module_1/test_file.txt'
    assert resource.file_type == 'text/plain'
    assert resource.file_size == 12
    assert resource.thumbnail is None

def test_resource_str_representation(resource):
    assert str(resource) == 'Test Resource'

def test_resource_save(resource):
    resource.save()
    assert resource.file_size == resource.file.size
    assert resource.file_type == resource.file.file.content_type