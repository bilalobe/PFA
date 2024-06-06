from rest_framework import serializers
from .models import Quiz, Question, AnswerChoice, UserQuizAttempt

class AnswerChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerChoice
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    choices = AnswerChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = '__all__'
        
class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True) 

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'module', 'questions')  

class UserQuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizAttempt
        fields = ('id', 'user', 'quiz', 'score', 'start_time', 'end_time', 'progress')

class UserQuizAttemptCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizAttempt
        fields = ('quiz', 'start_time', 'end_time', 'progress')

    def create(self, validated_data):
        attempt = UserQuizAttempt.objects.create(
            quiz=validated_data['quiz'],
            start_time=validated_data['start_time'],
            end_time=validated_data['end_time'],
            progress=validated_data['progress'],
            user=self.context['request'].user
        )
        return attempt

    def update(self, instance, validated_data):
        instance.end_time = validated_data.get('end_time', instance.end_time)
        instance.progress = validated_data.get('progress', instance.progress)
        instance.save()
        return instance
    
class UserQuizAttemptUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizAttempt
        fields = ('end_time', 'progress')

    def update(self, instance, validated_data):
        instance.end_time = validated_data.get('end_time', instance.end_time)
        instance.progress = validated_data.get('progress', instance.progress)
        instance.save()
        return instance


