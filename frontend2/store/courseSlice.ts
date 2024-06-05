// frontend2/store/courseSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface QuizDetails {
  // Define the structure of quizDetails here
}

interface CourseState {
  loading: boolean;
  error: string | null;
  quiz?: QuizDetails;
}

const initialState: CourseState = {
  loading: false,
  error: null,
};

const apiUrl = 'http://localhost:8000/api';

// Create Quiz
export const createQuiz = createAsyncThunk<
  QuizDetails,
  { courseId: string; quizDetails: QuizDetails },
  { rejectValue: string }
>(
  'course/createQuiz',
  async ({ courseId, quizDetails }, thunkAPI) => {
    try {
      const response = await axios.post(`${apiUrl}/courses/${courseId}/quizzes/`, quizDetails);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action: PayloadAction<QuizDetails>) => {
        state.loading = false;
        state.quiz = action.payload;
      })
      .addCase(createQuiz.rejected, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default courseSlice.reducer;