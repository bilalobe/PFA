from rest_framework.views import APIView
from rest_framework.response import Response
from cours.models import Cours
from .serializers import CoursSerializer  # Importez le sérialiseur

class CoursListView(APIView):
    def get(self):  # Utilisez request ici
        cours = Cours.objects.all()
        serializer = CoursSerializer(cours, many=True)
        return Response(serializer.data)

    def post(self):
        # Handle POST requests here
        pass