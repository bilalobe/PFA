from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for listing users, showing basic information.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'user_type', 'bio', 'profile_picture') 

class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving a user's details, including enrollments.
    """
    enrollments = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = User
        fields = '__all__'  

class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for registering new users. 
    Password field is write-only.
    """
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'user_type')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create(**validated_data)
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user details.
    """
    class Meta:
        model = User
        fields = ('username', 'email', 'user_type', 'bio', 'profile_picture')

