from django.test import TestCase
from django.db.utils import IntegrityError
from django.contrib.auth.models import User
from backend.courses.models import Course
from .models import Enrollment


class EnrollmentModelTests(TestCase):
    def setUp(self):
        """
        Create a test user and a test course for use in tests.
        """
        self.user = User.objects.create_user(
            username="testuser", email="testuser@example.com", password="testpassword"
        )
        self.course = Course.objects.create(
            title="Test Course",
            description="A test course description",
            instructor=self.user,
        )

    def test_create_enrollment(self):
        """
        Test creating a new enrollment.
        """
        enrollment = Enrollment.objects.create(student=self.user, course=self.course)
        self.assertEqual(enrollment.student, self.user)
        self.assertEqual(enrollment.course, self.course)

    def test_prevent_duplicate_enrollment(self):
        """
        Test that a user cannot enroll in the same course twice.
        """
        Enrollment.objects.create(student=self.user, course=self.course)
        with self.assertRaises(
            IntegrityError
        ):  # Django typically raises IntegrityError for duplicates
            Enrollment.objects.create(student=self.user, course=self.course)
