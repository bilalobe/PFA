import {
  FETCH_QUIZ_REQUEST,
  FETCH_QUIZ_SUCCESS,
  FETCH_QUIZ_FAILURE,
  SUBMIT_QUIZ_REQUEST,
  SUBMIT_QUIZ_SUCCESS,
  SUBMIT_QUIZ_FAILURE,
} from './types';
import { quizApi } from '../api/api';

// Fetch Quiz Action
export const fetchQuiz = createAsyncThunk(
  'quiz/fetchQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await quizApi.fetchQuiz(quizId); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Submit Quiz Action
export const submitQuiz = createAsyncThunk(
  'quiz/submitQuiz',
  async ({ quizId, selectedAnswers }, { rejectWithValue }) => {
    try {
      const response = await quizApi.submitQuiz(quizId, selectedAnswers);
      return response.data.score;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch Quizzes for Module Action
export const fetchQuizzesForModule = createAsyncThunk(
  'quiz/fetchQuizzesForModule',
  async (moduleId, { rejectWithValue }) => {
    try {
      const response = await quizApi.fetchQuizzesForModule(moduleId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch Quizzes with Filters Action
export const fetchQuizzes = createAsyncThunk(
  'quiz/fetchQuizzes',
  async ({ moduleId, difficulty }, { rejectWithValue }) => {
    try {
      const response = await quizApi.fetchQuizzes(moduleId, difficulty);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Search Quizzes Action
export const searchQuizzes = createAsyncThunk(
  'quiz/searchQuizzes',
  async (searchQuery, { rejectWithValue }) => {
    try {
      const response = await quizApi.searchQuizzes(searchQuery);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Start Quiz Attempt Action
export const startQuizAttempt = createAsyncThunk(
  'quiz/startQuizAttempt',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await quizApi.startQuizAttempt(quizId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Submit Quiz Answers Action
export const submitQuizAnswers = createAsyncThunk(
  'quiz/submitQuizAnswers',
  async ({ attemptId, answers }, { rejectWithValue }) => {
    try {
      const response = await quizApi.submitQuizAnswers(attemptId, answers);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);