import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = 'http://localhost:8000/api';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface QuizResult {
  score: number;
  // Add other result properties
}

interface QuestionState {
  questions: Question[];
  loading: boolean;
  error: string | null;
  result: QuizResult | null;
}

// Fetch Questions
export const fetchQuestions = createAsyncThunk<Question[], number, { rejectValue: string }>(
  'question/fetchQuestions',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await axios.get<Question[]>(`${apiUrl}/quizzes/${quizId}/questions/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// Submit Quiz
export const submitQuiz = createAsyncThunk<QuizResult, { quizId: number, answers: any }, { rejectValue: string }>(
  'question/submitQuiz',
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      const response = await axios.post<QuizResult>(`${apiUrl}/quizzes/${quizId}/submit/`, { answers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

const initialState: QuestionState = {
  questions: [],
  loading: false,
  error: null,
  result: null,
};

const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchQuestions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action: PayloadAction<Question[]>) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle submitQuiz
      .addCase(submitQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action: PayloadAction<QuizResult>) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default questionSlice.reducer;