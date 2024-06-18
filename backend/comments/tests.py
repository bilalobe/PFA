from django.test import TestCase
from django.contrib.auth.models import User
from .models import Comment, Post  # Assuming there's a Post model

class CommentModelTest(TestCase):
    def setUp(self):
        # Create a user
        self.user = User.objects.create_user(username='testuser', password='12345')
        # Create a post
        self.post = Post.objects.create(title='Test Post', content='Just a test', author=self.user)
        # Create a comment
        self.comment = Comment.objects.create(author=self.user, post=self.post, text='Test comment')

    def test_comment_creation(self):
        self.assertTrue(isinstance(self.comment, Comment))
        self.assertEqual(self.comment.__str__(), self.comment.text)

    def test_comment_fields(self):
        self.assertEqual(self.comment.author, self.user)
        self.assertEqual(self.comment.post, self.post)
        self.assertEqual(self.comment.text, 'Test comment')
        
    # Add more tests as needed for custom methods in your Comment model

    def tearDown(self):
        # Clean up after each test method
        self.user.delete()
        self.post.delete()
        self.comment.delete()