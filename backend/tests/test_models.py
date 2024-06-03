import pytest  
from django.contrib.auth.models import User  
from course.models import Module  

@pytest.mark.django_db  
def test_create_module():  
    user = User.objects.create_user(username='user1', password='pass1234')  
    module = Module.objects.create(title='Test Module', description='Test', owner=user)  
    assert module.title == "Test Module"  