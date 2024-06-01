from rest_framework import serializers
from .models import Module

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ('id', 'title', 'description', 'order')

class ModuleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = '__all__' 

class ModuleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ('title', 'description', 'course', 'order', 'content')
        extra_kwargs = {
            'order': {'required': True},
            'course': {'required': True},
        }

    def validate(self, data):
        """
        Check if a module with the same order already exists within the course.
        """
        course = data.get('course')
        order = data.get('order')

        if Module.objects.filter(course=course, order=order).exists():
            raise serializers.ValidationError("A module with this order already exists in this course.")
        return data

class ModuleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ('title', 'description', 'order', 'content')
        extra_kwargs = {
            'order': {'required': False},
        }

    def validate(self, data):
        """
        Check if the new order is unique within the course, excluding the current module.
        """
        course = self.instance.course  # Get the course from the existing instance
        order = data.get('order')

        if order and Module.objects.filter(course=course, order=order).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("A module with this order already exists in this course.")
        return data