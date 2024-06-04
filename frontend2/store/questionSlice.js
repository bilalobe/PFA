// store/questionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = 'http://localhost:8000/api';

// Fetch Questions
export const fetchQuestions = createAsyncThunk(
  'question/fetchQuestions',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${apiUrl}/quizzes/${quizId}/questions/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// Submit Quiz
export const submitQuiz = createAsyncThunk(
  'question/submitQuiz',
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${apiUrl}/quizzes/${quizId}/submit/`, { answers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

const questionSlice = createSlice({
  name: 'question',
  initialState: {
    questions: [],
    loading: false,
    error: null,
    result: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchQuestions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle submitQuiz
      .addCase(submitQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default questionSlice.reducer;
