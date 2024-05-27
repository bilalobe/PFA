from backend.quiz import models
from question.models import DetailedUserPerformance, Question

def recommend_learning_path(user):
    performances = DetailedUserPerformance.objects.filter(user=user)
    weak_areas = performances.filter(correct=False).values('question').annotate(total=models.Count('id')).order_by('-total')
    
    recommended_quizzes = set()
    for performance in weak_areas:
        question = Question.objects.get(id=performance['question'])
        recommended_quizzes.add(question.quiz)
    
    return list(recommended_quizzes)
