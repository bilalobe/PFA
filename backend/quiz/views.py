from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework import filters
from .models import Quiz, Question, AnswerChoice, UserQuizAttempt
from .serializers import QuizSerializer, QuestionSerializer, AnswerChoiceSerializer, UserQuizAttemptSerializer
from datetime import datetime


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']  # Search by title or description
    ordering_fields = ['title', 'created_at']  # Allow ordering

    def get_queryset(self):
        queryset = Quiz.objects.all()
        module_id = self.request.query_params.get('module')
        difficulty = self.request.query_params.get('difficulty')
        if module_id is not None:
            queryset = queryset.filter(module_id=module_id)
        if difficulty is not None:
            queryset = queryset.filter(difficulty=difficulty)
        return queryset

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class AnswerChoiceViewSet(viewsets.ModelViewSet):
    queryset = AnswerChoice.objects.all()
    serializer_class = AnswerChoiceSerializer
    
class UserQuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = UserQuizAttempt.objects.all()
    serializer_class = UserQuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _calculate_score(self, quiz, user_selected_choices):
        total_score = 0
        for question in quiz.questions.all():
            # Optimization: Use 'in' query for checking choices
            correct_choices = AnswerChoice.objects.filter(question=question, is_correct=True).values_list('id', flat=True)
            if set(user_selected_choices).intersection(set(correct_choices)) == set(correct_choices):
                total_score += 5
        return total_score

    def _save_attempt(self, user, quiz, total_score, user_selected_choices):
        start_time = datetime.now()
        progress = min((len(user_selected_choices) / quiz.questions.count()) * 100, 100)

        # Attempt to retrieve an existing attempt for this user and quiz
        attempt, created = UserQuizAttempt.objects.get_or_create(
            user=user, quiz=quiz,
            defaults={
                'score': total_score,
                'start_time': start_time,
                'progress': progress
            }
        )

        # Update the score and progress if a new attempt was not created and the new score is higher
        if not created and total_score > attempt.score:
            attempt.score = total_score
            attempt.progress = progress
            attempt.save()

        return attempt

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        quiz_id = request.data.get('quiz')
        user_selected_choices = request.data.get('choices', [])

        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz not found"}, status=status.HTTP_400_BAD_REQUEST)

        total_score = self._calculate_score(quiz, user_selected_choices)
        attempt = self._save_attempt(request.user, quiz, total_score, user_selected_choices)

        serializer = self.get_serializer(attempt) # Serialize the saved attempt
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        end_time = datetime.now()
        progress = 100  # Assuming the quiz is now complete

        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save(end_time=end_time, progress=progress)
        
        return Response(serializer.data)
