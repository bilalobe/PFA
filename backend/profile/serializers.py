from rest_framework import serializers
from .models import Profile
from quiz.models import Module

class ProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    interested_modules = serializers.PrimaryKeyRelatedField(queryset=Module.objects.all(), many=True)

    class Meta:
        model = Profile
        fields = ['id', 'user', 'user_type', 'profile_picture', 'interested_modules']

    def create(self, validated_data):
        interested_modules = validated_data.pop('interested_modules', [])
        profile = Profile.objects.create(**validated_data)
        profile.interested_modules.set(interested_modules)
        return profile

    def update(self, instance, validated_data):
        interested_modules = validated_data.pop('interested_modules', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if interested_modules is not None:
            instance.interested_modules.set(interested_modules)
        
        instance.save()
        return instance
