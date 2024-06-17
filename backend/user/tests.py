from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from django.urls import reverse
from course.models import Course
from .models import User, Enrollment
from .serializers import UserSerializer


# Model Tests
class UserModelTests(TestCase):
    def test_create_user(self):
        """
        Test creating a regular user.
        """
        user = get_user_model().objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword",
            user_type="student",
        )
        self.assertEqual(user.username, "testuser")
        self.assertEqual(user.email, "testuser@example.com")
        self.assertTrue(user.is_active)
        self.assertEqual(user.user_type, "student")

    def test_create_superuser(self):
        """
        Test creating a superuser.
        """
        superuser = get_user_model().objects.create_superuser(
            username="testsuperuser",
            email="testsuperuser@example.com",
            password="testpassword",
        )
        self.assertEqual(superuser.username, "testsuperuser")
        self.assertEqual(superuser.email, "testsuperuser@example.com")
        self.assertTrue(superuser.is_active)
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)

    def test_create_user_no_username(self):
        """
        Test creating a user without a username raises an error.
        """
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user(
                username="", email="testuser@example.com", password="testpassword"
            )

    def test_create_user_no_email(self):
        """
        Test creating a user without an email raises an error.
        """
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user(
                username="testuser", email="", password="testpassword"
            )

    def test_create_user_invalid_email(self):
        """
        Test creating a user with an invalid email raises an error.
        """
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user(
                username="testuser", email="invalid", password="testpassword"
            )

    def test_create_user_no_password(self):
        """
        Test creating a user without a password raises an error.
        """
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user(
                username="testuser", email="testuser@example.com", password=""
            )

    def test_create_user_duplicate_username(self):
        """
        Test creating a user with a duplicate username raises an error.
        """
        get_user_model().objects.create_user(
            username="testuser", email="testuser@example.com", password="testpassword"
        )
        with self.assertRaises(IntegrityError):
            get_user_model().objects.create_user(
                username="testuser",
                email="testuser2@example.com",
                password="testpassword",
            )

    def test_create_user_duplicate_email(self):
        """
        Test creating a user with a duplicate email raises an error.
        """
        get_user_model().objects.create_user(
            username="testuser", email="testuser@example.com", password="testpassword"
        )
        with self.assertRaises(IntegrityError):
            get_user_model().objects.create_user(
                username="testuser2",
                email="testuser@example.com",
                password="testpassword",
            )


class EnrollmentModelTests(TestCase):
    def setUp(self):
        """
        Create a test user and a test course for use in tests.
        """
        self.user = get_user_model().objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword",
            user_type="student",
        )
        self.teacher = get_user_model().objects.create_user(
            username="testteacher",
            email="testteacher@example.com",
            password="testpassword",
            user_type="teacher",
        )
        self.course = Course.objects.create(
            title="Test Course",
            description="A test course description",
            instructor=self.teacher,
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
        with self.assertRaises(IntegrityError):
            Enrollment.objects.create(student=self.user, course=self.course)

    def test_enrollment_str(self):
        """
        Test the string representation of an Enrollment.
        """
        enrollment = Enrollment.objects.create(student=self.user, course=self.course)
        self.assertEqual(
            str(enrollment), f"{self.user.username} enrolled in {self.course.title}"
        )


# Serializer Tests
class UserSerializerTests(APITestCase):
    def test_user_serializer(self):
        """
        Test the UserSerializer.
        """
        user_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "user_type": "student",
            "bio": "Test bio",
        }
        serializer = UserSerializer(data=user_data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["username"], "testuser")
        self.assertEqual(serializer.validated_data["email"], "testuser@example.com")

    # ... (Add more tests for other serializers) ...


# ViewSet Tests
class UserViewSetTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword",
            user_type="student",
        )
        self.teacher = get_user_model().objects.create_user(
            username="testteacher",
            email="testteacher@example.com",
            password="testpassword",
            user_type="teacher",
        )
        self.course = Course.objects.create(
            title="Test Course", description="Test Description", instructor=self.teacher
        )
        self.enrollment = Enrollment.objects.create(
            student=self.user, course=self.course
        )

    def test_list_users(self):
        """
        Test listing users.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse("user-list")  # Use reverse to get the URL
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_user(self):
        """
        Test retrieving a specific user.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse("user-detail", args=[self.user.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_own_profile(self):
        """
        Test retrieving own profile using 'me' keyword.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse("user-detail", args=["me"])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.user.id)

    def test_create_user(self):
        """
        Test creating a new user.
        """
        url = reverse("user-list")
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword",
            "user_type": "student",
        }
        response = self.client.post(url, user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_own_profile(self):
        """
        Test updating own profile.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse("user-detail", args=[self.user.id])
        updated_data = {"bio": "Updated bio"}
        response = self.client.patch(url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["bio"], "Updated bio")

    def test_update_another_user_profile(self):
        """
        Test that a user cannot update another user's profile.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "user-detail", args=[self.teacher.id]
        )  # Try to update the teacher's profile
        updated_data = {"bio": "Updated bio"}
        response = self.client.patch(url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)  # Forbidden

    # ... Add more tests for other actions and scenarios ...


class EnrollmentViewSetTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword",
            user_type="student",
        )
        self.teacher = get_user_model().objects.create_user(
            username="testteacher",
            email="testteacher@example.com",
            password="testpassword",
            user_type="teacher",
        )
        self.course = Course.objects.create(
            title="Test Course", description="Test Description", instructor=self.teacher
        )
        self.enrollment = Enrollment.objects.create(
            student=self.user, course=self.course
        )

    def test_list_enrollments(self):
        """
        Test listing enrollments.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse("enrollment-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ... Add more tests for EnrollmentViewSet (create, delete, etc.) ...
