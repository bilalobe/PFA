from rest_framework import serializers
from .models import Module, Course, Quiz, Review, Comment
from quizzes.models import QuizQuestion, QuizAnswerChoice
from quizzes.serializers import QuizQuestionSerializer, QuizAnswerChoiceSerializer
from user.serializers import UserSerializer


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Course model.
    """

    instructor = UserSerializer(read_only=True)  # Use nested UserSerializer
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    average_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "description",
            "instructor",
            "created_at",
            "average_rating",
        )


class ModuleSerializer(serializers.ModelSerializer):
    """
    Serializer for the Module model (list view).
    """

    class Meta:
        model = Module
        fields = ("id", "title", "description", "order")


class ModuleDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for the Module model with full details (detail view).
    """

    course = CourseSerializer(read_only=True)
    created_by = serializers.CharField(source="created_by.username", read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)  # Include related quizzes
    resources = ResourceSerializer(
        many=True, read_only=True
    )  # Include related resources

    class Meta:
        model = Module
        fields = "__all__"


class ModuleCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new module.
    """

    class Meta:
        model = Module
        fields = ("title", "description", "course", "order", "content")
        extra_kwargs = {
            "order": {"required": True},
            "course": {"required": True},
        }


class ModuleUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a module.
    """

    class Meta:
        model = Module
        fields = ("title", "description", "content", "order")
        extra_kwargs = {
            "order": {"required": False},
        }

    def validate_order(self, value):
        """
        Check if the module order is unique within the course.
        """
        module_id = self.instance.id if self.instance else None
        course_id = self.context["request"].data.get("course")

        if (
            Module.objects.filter(course_id=course_id, order=value)
            .exclude(id=module_id)
            .exists()
        ):
            raise serializers.ValidationError(
                "Module order must be unique within a course."
            )
        return value


class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for the Review model.
    """

    user = serializers.CharField(source="user.username", read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Review
        fields = ("id", "user", "course", "rating", "comment", "created_at")


class ReviewCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new review.
    """

    class Meta:
        model = Review
        fields = ("rating", "comment", "course")
        extra_kwargs = {
            "course": {"write_only": True}
        }  # Course is provided in the context

    def validate(self, attrs):
        """
        Check if the user is enrolled in the course before creating a review.
        """
        request = self.context["request"]
        course = self.context["course"]

        if not request.user.enrollments.filter(course=course).exists():
            raise serializers.ValidationError(
                "You must be enrolled in the course to leave a review."
            )
        return attrs

    def create(self, validated_data):
        """
        Create a new Review instance.
        """
        request = self.context["request"]
        course = validated_data.pop("course")
        return Review.objects.create(user=request.user, course=course, **validated_data)


class QuizSerializer(serializers.ModelSerializer):
    """
    Serializer for the Quiz model.
    """

    created_by = serializers.CharField(source="created_by.username", read_only=True)
    questions = QuizQuestionSerializer(many=True, read_only=True)  # Nested questions

    class Meta:
        model = Quiz
        fields = (
            "id",
            "title",
            "description",
            "course",
            "created_by",
            "created_at",
            "questions",
        )


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Comment model.
    """

    author = serializers.CharField(source="author.username", read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Comment
        fields = ("id", "post", "author", "content", "created_at")
