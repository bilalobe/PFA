from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Cours
from ..dj_ango.serializers import CoursSerializer
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import RetrieveAPIView
from cours.views import CoursListView


class CoursDetailView(RetrieveAPIView):
    queryset = Cours.objects.all()
    serializer_class = CoursSerializer

class CoursListView(APIView):
    def get(self, request):
        cours = Cours.objects.all()
        serializer = CoursSerializer(cours, many=True)  # Sérialiser les données
        return Response(serializer.data) 

    def post(self, request):
        serializer = CoursSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            raise ValidationError(serializer.errors)