import { auth } from "../../firebaseConfig";
import { firestoreService, queryBuilders } from "../firebase/firestore";
import { handleApiError } from "../utils/errorHandling";
import { QuizData, QuestionData, AnswerData, QuizAttemptData } from "../../interfaces/types";
import { Timestamp } from "firebase/firestore";

export const quizApi = {
  fetchQuizzesForCourse: async (courseId: string) => {
    try {
      const quizzesPath = `courses/${courseId}/quizzes`;
      const result = await firestoreService.list<QuizData>(quizzesPath);
      return result.items;
    } catch (error) {
      handleApiError(error, `Failed to fetch quizzes for course ${courseId}.`);
      throw error;
    }
  },

  fetchQuiz: async (quizId: string) => {
    try {
      return await firestoreService.get<QuizData>('quizzes', quizId);
    } catch (error) {
      handleApiError(error, `Failed to fetch quiz ${quizId}`);
      throw error;
    }
  },

  fetchQuizQuestions: async (quizId: string) => {
    try {
      const questionsPath = `quizzes/${quizId}/questions`;
      const result = await firestoreService.list<QuestionData>(questionsPath);
      return result.items;
    } catch (error) {
      handleApiError(error, `Failed to fetch questions for quiz ${quizId}.`);
      throw error;
    }
  },

  submitQuizAttempt: async (quizId: string, answers: AnswerData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      // Calculate the score
      const score = calculateQuizScore(answers);
      const attemptData: QuizAttemptData = {
        user: user.uid,
        score,
        startedAt: Timestamp.fromDate(new Date()),
        completedAt: Timestamp.fromDate(new Date()),
      };
      
      return await firestoreService.create<QuizAttemptData>(`quizzes/${quizId}/attempts`, attemptData);
    } catch (error) {
      handleApiError(error, `Failed to submit quiz attempt for quiz ${quizId}.`);
      throw error;
    }
  }
};

// Helper function to calculate quiz score
const calculateQuizScore = (answers: any): number => {
  let score = 0;
  for (const answer of answers) {
    if (answer.isCorrect) {
      score++;
    }
  }
  return score;
};