from rest_framework import serializers
from .models import Module, Course, Quiz, Review, Comment
from quiz.models import QuizQuestion, QuizAnswerChoice
from quiz.serializers import QuizQuestionSerializer, QuizAnswerChoiceSerializer 


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Course model.
    """
    instructor = serializers.CharField(source='instructor.username', read_only=True) 
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M', read_only=True)

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'instructor', 'created_at')

class ModuleSerializer(serializers.ModelSerializer):
    """
    Serializer for the Module model.
    """
    class Meta:
        model = Module
        fields = ('id', 'title', 'description', 'content', 'order', 'created_at', 'updated_at') 

class ModuleDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for the Module model with full details.
    """
    course = CourseSerializer(read_only=True)
    created_by = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Module
        fields = '__all__'

class ModuleCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new module.
    """
    class Meta:
        model = Module
        fields = ('title', 'description', 'content', 'order', 'course') 
        extra_kwargs = {
            'order': {'required': True},
            'course': {'required': True},
        }

class ModuleUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a module.
    """
    class Meta:
        model = Module
        fields = ('title', 'description', 'content', 'order')
        extra_kwargs = {
            'order': {'required': False},
        }

    def validate_order(self, value):
        """
        Check if the module order is unique within the course.
        """
        module_id = self.instance.id if self.instance else None
        course_id = self.context['request'].data.get('course')

        if Module.objects.filter(course_id=course_id, order=value).exclude(id=module_id).exists():
            raise serializers.ValidationError('Module order must be unique within a course.')
        return value

class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for the Review model.
    """
    user = serializers.CharField(source='user.username', read_only=True) 
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'course', 'rating', 'comment', 'created_at')

class ReviewCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new review.
    """
    class Meta:
        model = Review
        fields = ('rating', 'comment')

class QuizSerializer(serializers.ModelSerializer):
    """
    Serializer for the Quiz model.
    """
    course = CourseSerializer(read_only=True)
    created_by = serializers.CharField(source='created_by.username', read_only=True)
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'description', 'course', 'created_by', 'created_at', 'questions')

class QuizQuestionSerializer(serializers.ModelSerializer):
    """
    Serializer for the QuizQuestion model.
    """
    quiz = QuizSerializer(read_only=True)
    created_by = serializers.CharField(source='created_by.username', read_only=True)
    choices = QuizAnswerChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ('id', 'quiz', 'text', 'question_type', 'order', 'created_at', 'created_by', 'choices')

class QuizAnswerChoiceSerializer(serializers.ModelSerializer):
    """
    Serializer for the QuizAnswerChoice model.
    """
    class Meta:
        model = QuizAnswerChoice
        fields = ('id', 'question', 'text', 'is_correct')

class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Comment model.
    """
    author = serializers.CharField(source='author.username', read_only=True)
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M', read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'content', 'created_at')