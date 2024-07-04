import logging
from rest_framework import serializers
from .models import CourseAnalytics, CourseVersion, DynamicContent, InteractiveElement, UserCourseInteraction, Course
from users.serializers import UserSerializer

logger = logging.getLogger(__name__)

class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Course model.
    """
    instructor = UserSerializer(read_only=True)  # Use nested UserSerializer
    created_at = serializers.DateTimeField(read_only=True)
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

class CourseVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseVersion
        fields = "__all__"

class DynamicContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicContent
        fields = "__all__"

class CourseAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseAnalytics
        fields = "__all__"

class InteractiveElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = InteractiveElement
        fields = "__all__"

class UserCourseInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCourseInteraction
        fields = '__all__'
