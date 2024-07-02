from rest_framework import serializers
from quizzes.serializers import QuizSerializer
from resources.serializers import ResourceSerializer
from courses.serializers import CourseSerializer
from common.validators import validate_order


class ModuleSerializer(serializers.ModelSerializer):
    """
    Serializer for modules (list view).
    """

    class Meta:
        fields = ("id", "title", "description", "order")


class ModuleDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for modules with full details (detail view).
    """

    course = CourseSerializer(read_only=True)
    created_by = serializers.CharField(source="username", read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    resources = ResourceSerializer(many=True, read_only=True)

    class Meta:
        fields = "__all__"


class ModuleCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new module.
    """

    class Meta:
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
        fields = ("title", "description", "content", "order")
        extra_kwargs = {
            "order": {"required": False},
        }

    def validate_order(self, value):
        """
        Check if the order is unique within the course.
        """
        module_id = self.instance.id if self.instance else None
        course_id = self.context["request"].data.get("course")
        return validate_order(value, course_id, module_id)