from collections import defaultdict
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from question.models import DetailedUserPerformance, Question
from .serializers import QuizRecommendationSerializer
from profile.models import Profile
from django.core.cache import cache
from django.db.models import Count
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_learning_path(request):
    user = request.user
    cache_key = f'recommendations_{user.id}'  # Generate unique cache key

    # Check if recommendations are cached
    cached_recommendations = cache.get(cache_key)
    if cached_recommendations:
        return Response(cached_recommendations)

    try:
        user_profile = Profile.objects.get(user=user)
        interested_modules = user_profile.interested_modules.all()

        performances = DetailedUserPerformance.objects.filter(user=user)
        weak_areas = performances.filter(correct=False).values('question').annotate(total=Count('id')).order_by('-total')

        recommended_quizzes = defaultdict(int)

        for performance in weak_areas:
            question = Question.objects.get(id=performance['question'])
            if question.quiz.module in interested_modules:
                recommended_quizzes[question.quiz] += performance['total']  # Increment weight

        sorted_quizzes = sorted(recommended_quizzes, key=recommended_quizzes.get, reverse=True)
        serializer = QuizRecommendationSerializer(sorted_quizzes, many=True)
        
        # Cache recommendations for 1 hour (adjust as needed)
        cache.set(cache_key, serializer.data, 60 * 60)
        return Response(serializer.data)
        
    except Profile.DoesNotExist:
        return Response({"error": "User profile not found."}, status=404)
    except Question.DoesNotExist:
        return Response({"error": "Question not found."}, status=404)
    except Exception as e:
        logger.error(f"Error in recommend_learning_path: {e}")
        return Response({"error": "An error occurred while generating recommendations."}, status=500)
