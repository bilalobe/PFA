from rest_framework import serializers
from .models import Module

class ModuleSerializer(serializers.ModelSerializer):
    """
    Serializer for listing and retrieving Module instances.
    """
    class Meta:
        model = Module
        fields = ('id', 'title', 'description', 'order')

class ModuleDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving detailed information about a Module instance.
    """
    class Meta:
        model = Module
        fields = '__all__' 

class ModuleCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new Module instance.
    Ensures that the 'order' field is unique within a course.
    """
    class Meta:
        model = Module
        fields = ('title', 'description', 'course', 'order', 'content')
        extra_kwargs = {
            'order': {'required': True},
            'course': {'required': True},
        }

    def validate(self, data):
        course = data.get('course')
        order = data.get('order')

        # Check if module with the same order already exists within the course
        if Module.objects.filter(course=course, order=order).exists():
            raise serializers.ValidationError("A module with this order already exists in this course.")

        return data

class ModuleUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating an existing Module instance.
    Ensures that the 'order' field is unique within a course when provided.
    """
    class Meta:
        model = Module
        fields = ('title', 'description', 'order', 'content')
        extra_kwargs = {
            'order': {'required': False},
        }

    def validate(self, data):
        if self.instance is not None:
            course = self.instance.course
        else:
            course = None
        order = data.get('order')

        # Check if the new order is unique within the course, excluding the current module.
        if order and self.instance is not None and Module.objects.filter(course=course, order=order).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("A module with this order already exists in this course.")

        return data
