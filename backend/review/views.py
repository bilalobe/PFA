from rest_framework import viewsets, permissions

from backend.cours.models import Cours
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_pk')
        course = Cours.objects.get(pk=course_id) 
        serializer.save(user=self.request.user, course=course)