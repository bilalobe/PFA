from rest_framework import serializers
from .models import Quiz, Question, AnswerChoice, UserQuizAttempt, DetailedUserPerformance

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'

class AnswerChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerChoice
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    choices = AnswerChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = '__all__'

class UserQuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizAttempt
        fields = '__all__'

class DetailedUserPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetailedUserPerformance
        fields = '__all__'
