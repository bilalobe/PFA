import pytest
from rest_framework_nested.routers import NestedSimpleRouter
from rest_framework.routers import DefaultRouter

from backend.users.urls import create_nested_router
from backend.users.views import UserViewSet

# Import the necessary viewset and create_nested_router function

@pytest.mark.django_db
def test_create_nested_router():
    parent_router = DefaultRouter()
    parent_prefix = 'users'
    lookup = 'user'
    viewset = UserViewSet
    basename = 'user-courses'

    nested_router = create_nested_router(parent_router, parent_prefix, lookup, viewset, basename)

    assert isinstance(nested_router, NestedSimpleRouter)
    assert nested_router.parent_prefix == parent_prefix
    assert nested_router.registry[0].__name__ == viewset.__name__
    assert nested_router.registry[0].__bases__ == viewset.__bases__
    assert nested_router.registry[0].__module__ == viewset.__module__
    assert nested_router.registry[0].basename == basename
