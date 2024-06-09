from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from .models import Enrollment
from backend.course.models import Course

User = get_user_model()

class UserModelTests(TestCase):
    def test_create_user(self):
        """
        Test creating a regular user.
        """
        user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'testuser@example.com')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        """
        Test creating a superuser.
        """
        superuser = User.objects.create_superuser(
            username='testsuperuser',
            email='testsuperuser@example.com',
            password='testpassword'
        )
        self.assertEqual(superuser.username, 'testsuperuser')
        self.assertEqual(superuser.email, 'testsuperuser@example.com')
        self.assertTrue(superuser.is_active)
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)

    def test_create_user_no_username(self):
        """
        Test creating a user without a username raises an error.
        """
        with self.assertRaises(ValueError):
            User.objects.create_user(
                username='',
                email='testuser@example.com',
                password='testpassword'
            )

    def test_create_user_no_email(self):
        """
        Test creating a user without an email raises an error.
        """
        with self.assertRaises(ValueError):
            User.objects.create_user(
                username='testuser',
                email='',
                password='testpassword'
            )

    def test_create_user_invalid_email(self):
        """
        Test creating a user with an invalid email raises an error.
        """
        with self.assertRaises(ValueError):
            User.objects.create_user(
                username='testuser',
                email='invalid',
                password='testpassword'
            )

    def test_create_user_no_password(self):
        """
        Test creating a user without a password raises an error.
        """
        with self.assertRaises(ValueError):
            User.objects.create_user(
                username='testuser',
                email='testuser@example.com',
                password=''
            )

    def test_create_user_duplicate_username(self):
        """
        Test creating a user with a duplicate username raises an error.
        """
        User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword'
        )
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                username='testuser',
                email='testuser2@example.com',
                password='testpassword'
            )

    def test_create_user_duplicate_email(self):
        """
        Test creating a user with a duplicate email raises an error.
        """
        User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword'
        )
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                username='testuser2',
                email='testuser@example.com',
                password='testpassword'
            )

class EnrollmentModelTests(TestCase):
    def setUp(self):
        """
        Create a test user and a test course for use in tests.
        """
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword'
        )
        self.course = Course.objects.create(
            title="Test Course",
            description="A test course description",
            instructor=self.user
        )

    def test_create_enrollment(self):
        """
        Test creating a new enrollment.
        """
        enrollment = Enrollment.objects.create(
            student=self.user,
            course=self.course
        )
        self.assertEqual(enrollment.student, self.user)
        self.assertEqual(enrollment.course, self.course)

    def test_prevent_duplicate_enrollment(self):
        """
        Test that a user cannot enroll in the same course twice.
        """
        Enrollment.objects.create(student=self.user, course=self.course)
        with self.assertRaises(IntegrityError):  # Django typically raises IntegrityError for duplicates
            Enrollment.objects.create(student=self.user, course=self.course)
