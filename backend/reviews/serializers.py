import logging
from rest_framework import serializers
from .models import Review

logger = logging.getLogger(__name__)

class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for the Review model.
    """
    user = serializers.CharField(source="user.username", read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

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
        }

    def validate(self, attrs):
        request = self.context["request"]
        course = self.context["course"]
        if not request.user.enrollments.filter(course=course).exists():
            raise serializers.ValidationError("You must be enrolled in the course to leave a review.")
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        if request is None:
            raise serializers.ValidationError("Request object is missing in the serializer context.")
        course = validated_data.pop("course")
        return Review.objects.create(user=request.user, course=course, **validated_data)

class ReviewUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a review.
    """
    class Meta:
        model = Review
        fields = ("comment",)
        extra_kwargs = {
            "comment": {"required": True}
        }

    def validate(self, attrs):
        review = self.instance
        request = self.context.get("request")
        if request is None:
            raise serializers.ValidationError("Request object is missing in the serializer context.")
        if review and review.user != request.user:
            raise serializers.ValidationError("You do not have permission to update this review.")
        return attrs

class ReviewLikeSerializer(serializers.Serializer):
    """
    Serializer for liking a review.
    """
    pass
