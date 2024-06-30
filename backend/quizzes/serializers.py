import logging
from rest_framework import serializers
from .models import Quiz, QuizQuestion, QuizAnswerChoice, UserQuizAttempt
from django.utils import timezone

logger = logging.getLogger(__name__)

class QuizSerializer(serializers.ModelSerializer):
    created_by = serializers.CharField(source="created_by.username", read_only=True)
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = (
            "id",
            "title",
            "description",
            "course",
            "created_by",
            "created_at",
            "questions",
        )

    def get_questions(self, obj):
        serializer = QuizQuestionSerializer(obj.questions.all(), many=True)
        return serializer.data

class QuizAnswerChoiceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = QuizAnswerChoice
        fields = "__all__"

class QuizQuestionSerializer(serializers.ModelSerializer):
    choices = QuizAnswerChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = "__all__"

class UserQuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizAttempt
        fields = "__all__"
        read_only_fields = (
            "user",
            "score",
            "start_time",
            "end_time",
            "completed",
        )

class UserQuizAttemptCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizAttempt
        fields = ("quiz",)

    def create(self, validated_data):
        return UserQuizAttempt.objects.create(
            user=self.context["request"].user,
            quiz=validated_data["quiz"],
            start_time=timezone.now(),
        )

class UserQuizAttemptUpdateSerializer(serializers.ModelSerializer):
    answers = serializers.JSONField(write_only=True)

    class Meta:
        model = UserQuizAttempt
        fields = ("end_time", "progress", "answers", "completed")

    def update(self, instance, validated_data):
        instance.end_time = validated_data.get("end_time", instance.end_time)
        instance.progress = validated_data.get("progress", instance.progress)
        submitted_answers = validated_data.get("answers", [])

        instance.score = self.calculate_quiz_score(submitted_answers)

        if instance.progress == 100:
            instance.completed = True
        instance.save()
        return instance

    def calculate_quiz_score(self, answers):
        total_score = 0
        for answer in answers:
            question_id = answer.get('question_id')
            selected_choice_id = answer.get('selected_choice_id')

            question = self.get_question(question_id)
            correct_choice = QuizAnswerChoice.objects.filter(
                question=question, is_correct=True
            ).first()

            if correct_choice and str(correct_choice.id) == selected_choice_id:
                total_score += 5
        return total_score

    @staticmethod
    def get_question(question_id):
        return QuizQuestion.objects.get(id=question_id)
