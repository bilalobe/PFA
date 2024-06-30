from firebase_admin import firestore
import spacy

db = firestore.client()

nlp = spacy.load("en_core_web_sm")

def calculate_similarity(text1, text2):
    """
    Calculate similarity between two texts using spaCy.
    """
    doc1 = nlp(text1)
    doc2 = nlp(text2)
    return doc1.similarity(doc2)

def auto_grade_quiz_attempt(quiz_attempt_id):
    """
    Automatically grade a quiz attempt by comparing submitted answers with correct answers.
    """
    try:
        quiz_attempt_ref = db.collection('UserQuizAttempts').document(quiz_attempt_id)
        quiz_attempt = quiz_attempt_ref.get()
        if not quiz_attempt.exists:
            print("Quiz attempt not found.")
            return
        quiz_attempt_data = quiz_attempt.to_dict()

        if quiz_attempt_data is None:
            print("Quiz data is missing in the quiz attempt.")
            return
        if quiz_attempt_data and ('quiz' not in quiz_attempt_data or quiz_attempt_data['quiz'] is None):
            print("Quiz data is missing in the quiz attempt.")
            return

        questions_ref = db.collection('QuizQuestions')
        questions = questions_ref.where('quiz', '==', quiz_attempt_data['quiz']).stream()

        total_score = 0

        for question in questions:
            question_data = question.to_dict()
            if not question_data:
                continue  # Skip if question_data is None or empty

            question_type = question_data.get('question_type')
            if question_type in ["multiple_choice", "true_false"]:
                selected_choice_ref = quiz_attempt_ref.collection('answers').document(question.id)
                selected_choice_doc = selected_choice_ref.get()
                if selected_choice_doc.exists:
                    selected_choice = selected_choice_doc.to_dict()
                    if selected_choice and selected_choice.get('is_correct'):
                        total_score += 1
            elif question_type == "short_answer":
                submitted_answer_ref = quiz_attempt_ref.collection('answers').document(question.id)
                submitted_answer_doc = submitted_answer_ref.get()
                if submitted_answer_doc.exists:
                    submitted_answer = submitted_answer_doc.to_dict().get('text', '')
                    correct_answer = question_data.get('short_answer', '')
                    if submitted_answer and correct_answer:  # Ensure both answers are not empty
                        similarity = calculate_similarity(submitted_answer, correct_answer)
                        if similarity > 0.8:
                            total_score += 1

        # Update the quiz attempt document with the total score and completion status
        quiz_attempt_ref.update({'score': total_score, 'completed': True})
    except Exception as e:
        print(f"An error occurred: {e}")

def evaluate_test_attempt(attempt_data):
    quiz_attempt_id = attempt_data['id']
    quiz_attempt_ref = db.collection('UserQuizAttempts').document(quiz_attempt_id)
    quiz_id = attempt_data['quiz']
    questions_ref = db.collection('QuizQuestions')
    questions = questions_ref.where('quiz', '==', quiz_id).stream()

    total_score = 0
    correct_answers = 0
    answered_questions = len(attempt_data.get('answers', []))

    for question in questions:
        question_data = question.to_dict()
        if question_data is None:
            continue  
        question_id = question.id
        # Safely access 'question_type' and 'correct_answer' with default values
        question_type = question_data.get('question_type', '')
        correct_answer = question_data.get('correct_answer', '')

        submitted_answer = attempt_data.get('answers', {}).get(question_id, '')

        if question_type in ["multiple_choice", "true_false"]:
            if submitted_answer == correct_answer:
                total_score += 1  # Assuming each question has equal weight
                correct_answers += 1
        elif question_type == "short_answer":
            similarity = calculate_similarity(submitted_answer, correct_answer)
            if similarity > 0.8:  # Assuming a threshold for short answer questions
                total_score += 1
                correct_answers += 1

    # Update the quiz attempt with the calculated score and mark it as completed
    quiz_attempt_ref.update({
        'score': total_score,
        'correct_answers': correct_answers,
        'answered_questions': answered_questions,
        'completed': True
    })

    return {
        'score': total_score,
        'correct_answers': correct_answers,
        'answered_questions': answered_questions,
        'completed': True
    }