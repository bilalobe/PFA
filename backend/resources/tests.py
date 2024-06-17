from django.test import TestCase
from rest_framework.test import APIRequestFactory
from resources.views import ResourceViewSet
from resources.permissions import IsEnrolledStudent
from user.models import User, Enrollment
from courses.models import Course, Module
from .models import Resource


class IsEnrolledStudentPermissionTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.view = ResourceViewSet.as_view({"get": "retrieve"})
        self.user = User.objects.create(
            username="teststudent",
            email="teststudent@example.com",
            password="testpassword",
            user_type="student",
        )
        self.instructor = User.objects.create(
            username="testinstructor",
            email="testinstructor@example.com",
            password="testpassword",
            user_type="teacher",
        )
        self.course = Course.objects.create(
            title="Test Course",
            description="Test Description",
            instructor=self.instructor,
        )
        self.module = Module.objects.create(
            course=self.course, title="Test Module", content="Test Content", order=1
        )
        self.resource = Resource.objects.create(
            module=self.module,
            title="Test Resource",
            description="Test Description",
            file="test.pdf",
        )

    def test_enrolled_student_can_view_resource(self):
        Enrollment.objects.create(student=self.user, course=self.course)
        request = self.factory.get("/fake-url/")
        request.user = self.user
        response = self.view(request, pk=self.resource.pk)
        self.assertEqual(response.status_code, 200)  # Check for 200 OK

    def test_non_enrolled_student_cannot_view_resource(self):
        request = self.factory.get("/fake-url/")
        request.user = self.user
        response = self.view(request, pk=self.resource.pk)
        self.assertEqual(response.status_code, 403)  # Check for 403 Forbidden

    def test_unauthenticated_user_cannot_view_resource(self):
        request = self.factory.get("/fake-url/")
        response = self.view(request, pk=self.resource.pk)
        self.assertEqual(response.status_code, 401)  # Check for 401 Unauthorized
