import logging
from rest_framework import serializers
from .models import Enrollment

logger = logging.getLogger(__name__)

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = "__all__"
