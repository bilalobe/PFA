from rest_framework import serializers
from .models import Quiz, QuizQuestion, QuizAnswerChoice, UserQuizAttempt
from django.utils import timezone 

class QuizAnswerChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswerChoice
        fields = '__all__'

class QuizQuestionSerializer(serializers.ModelSerializer):
    choices = QuizAnswerChoiceSerializer(many=True, read_only=True) 

    class Meta:
        model = QuizQuestion
        fields = '__all__'

class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = '__all__'

class UserQuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizAttempt
        fields = '__all__'
        read_only_fields = ('user', 'score', 'start_time', 'end_time', 'completed') 

class UserQuizAttemptCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizAttempt
        fields = ('quiz',)

    def create(self, validated_data):
        """
        Automatically associates the attempt with the current user and sets the start time.
        """
        return UserQuizAttempt.objects.create(
            user=self.context['request'].user,
            quiz=validated_data['quiz'],
            start_time=timezone.now()
        )

class UserQuizAttemptUpdateSerializer(serializers.ModelSerializer):
    answers = serializers.JSONField(write_only=True)

    class Meta:
        model = UserQuizAttempt
        fields = ('end_time', 'progress', 'answers', 'completed')

    def update(self, instance, validated_data):
        """
        Updates the attempt with provided data, calculates score, and marks as complete if necessary.
        """
        instance.end_time = validated_data.get('end_time', instance.end_time)
        instance.progress = validated_data.get('progress', instance.progress)
        submitted_answers = validated_data.get('answers', [])

        # Calculate the score (replace with your actual score calculation logic)
        instance.score = calculate_quiz_score(instance.quiz, submitted_answers)

        if instance.progress == 100:  # If progress is 100%, mark as completed
            instance.completed = True
        instance.save()
        return instance

# Helper function to calculate the quiz score (you need to implement this)
def calculate_quiz_score(quiz, answers):
    # ... your logic to calculate the score based on answers ...
    score = 0  # Replace with your actual score calculation logic
    return score
