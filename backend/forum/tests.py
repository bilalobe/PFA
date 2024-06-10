from django.test import TestCase, Client
from django.contrib.auth.models import User, Permission

from backend.course.models import Course
from .models import Forum, Thread, Post, Comment, Moderation
from rest_framework.test import APIClient
from rest_framework import status

class ForumModelTests(TestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username='testinstructor',
            email='testinstructor@example.com',
            password='testpassword',
            user_type='teacher'
        )
        self.student = User.objects.create_user(
            username='teststudent',
            email='teststudent@example.com',
            password='testpassword',
            user_type='student'
        )
        self.course = Course.objects.create(
            title='Test Course', 
            description='Test Course Description', 
            instructor=self.instructor
        )
        self.forum = Forum.objects.create(
            title='Test Forum', 
            course=self.course, 
            description='Test Forum Description'
        )

    def test_forum_creation(self):
        """
        Test creating a new forum.
        """
        self.assertEqual(self.forum.title, 'Test Forum')
        self.assertEqual(self.forum.course, self.course)
        self.assertEqual(str(self.forum), 'Test Forum')

class ThreadModelTests(TestCase):
    def setUp(self):
        # ... (Similar setup as in ForumModelTests) ...
        self.thread = Thread.objects.create(
            forum=self.forum, 
            title='Test Thread', 
            created_by=self.student
        )

    def test_thread_creation(self):
        """
        Test creating a new thread.
        """
        self.assertEqual(self.thread.title, 'Test Thread')
        self.assertEqual(self.thread.forum, self.forum)
        self.assertEqual(self.thread.created_by, self.student)
        self.assertEqual(str(self.thread), 'Test Thread')

class PostModelTests(TestCase):
    def setUp(self):
        # ... (Similar setup as in previous tests) ...
        self.thread = Thread.objects.create(forum=self.forum, title='Test Thread', created_by=self.student)
        self.post = Post.objects.create(
            thread=self.thread, 
            author=self.student, 
            content="This is a test post."
        )

    def test_post_creation(self):
        """
        Test creating a new post.
        """
        self.assertEqual(self.post.content, "This is a test post.")
        self.assertEqual(self.post.thread, self.thread)
        self.assertEqual(self.post.author, self.student)

    def test_analyze_sentiment(self):
        """
        Test sentiment analysis on post content.
        """
        self.assertEqual(self.post.sentiment, 'neutral') # Assuming 'This is a test post' has a neutral sentiment

        positive_post = Post.objects.create(
            thread=self.thread,
            author=self.student,
            content="This course is fantastic!"
        )
        self.assertEqual(positive_post.sentiment, 'positive')

    def test_detect_language(self):
        """
        Test language detection on post content.
        """
        self.assertEqual(self.post.language, 'en')

    def test_correct_spelling(self):
        """
        Test spelling correction.
        """
        post_with_typo = Post.objects.create(
            thread=self.thread,
            author=self.student,
            content="Thsi is a tst post."
        )
        self.assertEqual(post_with_typo.correct_spelling("Thsi is a tst post."), "This is a test post.")

class CommentModelTests(TestCase):
    def setUp(self):
        # ... (Similar setup as in previous tests) ...
        self.comment = Comment.objects.create(
            post=self.post, 
            author=self.instructor, 
            content="This is a test comment."
        )

    def test_comment_creation(self):
        """
        Test creating a new comment.
        """
        self.assertEqual(self.comment.content, "This is a test comment.")
        self.assertEqual(self.comment.post, self.post)
        self.assertEqual(self.comment.author, self.instructor)

class ModerationModelTests(TestCase):
    def setUp(self):
        # ... (Similar setup as in previous tests) ...
        self.moderation = Moderation.objects.create(
            post=self.post, 
            reason='offensive', 
            reported_by=self.instructor
        )

    def test_moderation_creation(self):
        """
        Test creating a new moderation report.
        """
        self.assertEqual(self.moderation.reason, 'offensive')
        self.assertEqual(self.moderation.post, self.post)
        self.assertEqual(self.moderation.reported_by, self.instructor)

class ForumViewTests(TestCase):
    def setUp(self):
        # ... (Similar setup as in previous tests) ...
        self.client = APIClient()
        self.client.force_authenticate(user=self.instructor)

    def test_list_forums(self):
        """
        Test retrieving a list of forums.
        """
        response = self.client.get('/api/forums/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) 
        self.assertEqual(response.data[0]['title'], 'Test Forum')

    # ... (Add more tests for other views: create, retrieve, update, delete)

class PermissionTests(TestCase):
    def setUp(self):
        # ... (Similar setup as in previous tests) ...
        # Add 'forum.delete_post' permission to the instructor
        permission = Permission.objects.get(codename='delete_post')
        self.instructor.user_permissions.add(permission)
        self.post = Post.objects.create(
            thread=self.thread, 
            author=self.student, 
            content="This is a test post."
        )

    def test_instructor_can_delete_post(self):
        self.client.force_authenticate(user=self.instructor)
        response = self.client.delete(f'/api/posts/{self.post.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_student_cannot_delete_post(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.delete(f'/api/posts/{self.post.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class ModerationViewTests(TestCase):
    def setUp(self):
        # ... (Similar setup as in previous tests) ...
        self.moderation = Moderation.objects.create(
            post=self.post, 
            reason='offensive', 
            reported_by=self.instructor
        )
        self.client.force_authenticate(user=self.instructor)

    def test_moderation_dashboard_access(self):
        response = self.client.get('/api/moderation/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_take_action_view(self):
        response = self.client.get(f'/api/moderation/{self.moderation.id}/take_action/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)