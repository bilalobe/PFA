import { create } from 'zustand';
import { 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { QuizQuestion, QuizAnswerChoice, QuizAttempt } from '../../../interfaces/types';

interface QuizState {
  quizzes: any[];
  currentQuiz: any | null;
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
  selectedAnswers: Record<string, string>;
  loading: boolean;
  error: string | null;
  score: number | null;
  
  // Actions
  fetchQuizzes: (courseId: string) => Promise<void>;
  fetchQuiz: (quizId: string) => Promise<void>;
  fetchQuestions: (quizId: string) => Promise<void>;
  fetchAttempts: (quizId: string) => Promise<void>;
  createQuiz: (quiz: any) => Promise<string>;
  updateQuiz: (quizId: string, quiz: any) => Promise<void>;
  deleteQuiz: (quizId: string) => Promise<void>;
  submitAnswer: (quizId: string, questionId: string, answerId: string) => void;
  submitQuiz: (quizId: string) => Promise<void>;
  clearQuizState: () => void;
  setError: (error: string | null) => void;
}

export const quizStore = create<QuizState>((set, get) => ({
  quizzes: [],
  currentQuiz: null,
  questions: [],
  attempts: [],
  selectedAnswers: {},
  loading: false,
  error: null,
  score: null,
  
  fetchQuizzes: async (courseId: string) => {
    set({ loading: true, error: null });
    try {
      const quizzesQuery = query(
        collection(db, 'quizzes'), 
        where('courseId', '==', courseId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(quizzesQuery);
      const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ quizzes, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchQuiz: async (quizId: string) => {
    set({ loading: true, error: null });
    try {
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (quizDoc.exists()) {
        set({ currentQuiz: { id: quizDoc.id, ...quizDoc.data() }, loading: false });
      } else {
        set({ error: 'Quiz not found', loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchQuestions: async (quizId: string) => {
    set({ loading: true, error: null });
    try {
      const questionsQuery = query(
        collection(db, `quizzes/${quizId}/questions`),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(questionsQuery);
      const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizQuestion));
      set({ questions, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchAttempts: async (quizId: string) => {
    set({ loading: true, error: null });
    try {
      // This should be filtered by user ID in a real implementation
      const attemptsQuery = query(
        collection(db, `quizAttempts`),
        where('quizId', '==', quizId)
      );
      const snapshot = await getDocs(attemptsQuery);
      const attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
      set({ attempts, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  createQuiz: async (quiz) => {
    set({ loading: true, error: null });
    try {
      const quizData = {
        ...quiz,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'quizzes'), quizData);
      set(state => ({ 
        quizzes: [{ id: docRef.id, ...quizData }, ...state.quizzes],
        loading: false 
      }));
      return docRef.id;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return '';
    }
  },
  
  updateQuiz: async (quizId, quiz) => {
    set({ loading: true, error: null });
    try {
      await updateDoc(doc(db, 'quizzes', quizId), {
        ...quiz,
        updatedAt: serverTimestamp()
      });
      set(state => ({
        quizzes: state.quizzes.map(q => q.id === quizId ? { ...q, ...quiz } : q),
        currentQuiz: state.currentQuiz?.id === quizId ? { ...state.currentQuiz, ...quiz } : state.currentQuiz,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  deleteQuiz: async (quizId) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      set(state => ({ 
        quizzes: state.quizzes.filter(q => q.id !== quizId),
        loading: false 
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  submitAnswer: (quizId, questionId, answerId) => {
    set(state => ({
      selectedAnswers: { 
        ...state.selectedAnswers, 
        [questionId]: answerId 
      }
    }));
  },
  
  submitQuiz: async (quizId) => {
    set({ loading: true, error: null });
    try {
      const { selectedAnswers, questions } = get();
      
      // Calculate score
      let score = 0;
      questions.forEach(question => {
        if (selectedAnswers[question.id] === question.correctAnswer) {
          score++;
        }
      });
      
      // Create an attempt record
      await addDoc(collection(db, 'quizAttempts'), {
        quizId,
        userId: 'current-user-id', // This should be the actual user ID
        answers: selectedAnswers,
        score,
        totalQuestions: questions.length,
        submittedAt: serverTimestamp()
      });
      
      set({ score, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  clearQuizState: () => {
    set({
      currentQuiz: null,
      questions: [],
      selectedAnswers: {},
      score: null,
      error: null
    });
  },
  
  setError: (error) => {
    set({ error });
  }
}));