from rest_framework import serializers
from .models import User
from django.contrib.auth.models import UserManager

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'user_type')

class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model with full details.
    """
    class Meta:
        model = User
        fields = '__all__'

class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new user.
    """
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password', 'user_type')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            user_type=validated_data['user_type']
        )
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a user.
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'bio', 'profile_picture', 'user_type'] 

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.user_type = validated_data.get('user_type', instance.user_type)
        instance.save()
        return instance