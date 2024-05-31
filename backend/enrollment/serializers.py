from rest_framework import serializers
from .models import Enrollment

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ('student', 'enrolled_at')  # Prevent modification of these fields