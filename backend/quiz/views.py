from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Quiz, Question, AnswerChoice, UserQuizAttempt
from .serializers import QuizSerializer, QuestionSerializer, AnswerChoiceSerializer, UserQuizAttemptSerializer
from datetime import datetime

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        quiz_id = request.data.get('quiz')
        user_selected_choices = request.data.get('choices', [])  # List of choice IDs
        
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz not found"}, status=status.HTTP_400_BAD_REQUEST)
        
        total_score = 0
        for question in quiz.questions.all():
            all_correct = True
            question_choices = AnswerChoice.objects.filter(question=question)
            
            # Check if the user's selected choices are correct
            for choice in question_choices:
                if choice.is_correct and choice.id not in user_selected_choices:
                    all_correct = False
                    break
                if not choice.is_correct and choice.id in user_selected_choices:
                    all_correct = False
                    break
            
            if all_correct:
                total_score += 5
        
        previous_attempt = UserQuizAttempt.objects.filter(user=request.user, quiz=quiz).order_by('-score').first()

        if not previous_attempt or total_score > previous_attempt.score:
            start_time = datetime.now()
            end_time = None
            progress = min((len(user_selected_choices) / quiz.questions.count()) * 100, 100)

            serializer.save(
                user=request.user, 
                quiz=quiz, 
                score=total_score, 
                start_time=start_time, 
                end_time=end_time, 
                progress=progress
            )
        
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
