import spacy
from .models import UserQuizAttempt, QuizQuestion
from django.db.models import Q

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")

def calculate_similarity(text1, text2):
    """
    Calculate similarity between two texts using spaCy.
    """
    doc1 = nlp(text1)
    doc2 = nlp(text2)
    return doc1.similarity(doc2)

def auto_grade_quiz_attempt(quiz_attempt_id):
    try:
        quiz_attempt = UserQuizAttempt.objects.get(id=quiz_attempt_id)
        questions = QuizQuestion.objects.filter(quiz=quiz_attempt.quiz)
        total_score = 0

        for question in questions:
            if question.question_type in ["multiple_choice", "true_false"]:
                selected_choice = quiz_attempt.answers.get(question=question)
                if selected_choice.is_correct:
                    total_score += 1
            elif question.question_type == "short_answer":
                submitted_answer = quiz_attempt.answers.get(question=question).text
                # Use NLP-based text similarity for grading
                similarity = calculate_similarity(submitted_answer, question.short_answer)
                if similarity > 0.8:
                    total_score += 1

        quiz_attempt.score = total_score
        quiz_attempt.completed = True
        quiz_attempt.save()
    except UserQuizAttempt.DoesNotExist:
        print("Quiz attempt not found.")
