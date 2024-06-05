import { resetQuiz } from '@/redux/actions/quizActions';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuizState {
  quiz: any; // replace 'any' with the type of your quiz
  answers: { [key: string]: any }; // replace 'any' with the type of your answers
  score: number;
  loading: boolean;
  error?: string;
}

const initialState: QuizState = {
  quiz: null,
  answers: {},
  score: 0,
  loading: false,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    fetchQuizRequest: (state) => {
      state.loading = true;
    },
    fetchQuizSuccess: (state, action: PayloadAction<any>) => { // replace 'any' with the type of your quiz
      state.quiz = action.payload;
      state.loading = false;
    },
    fetchQuizFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    submitAnswer: (state, action: PayloadAction<{ questionId: string, answer: any }>) => { // replace 'any' with the type of your answer
      const { questionId, answer } = action.payload;
        state.answers[questionId] = answer;
    },
    resetQuiz: () => initialState,
  },
});

export const { fetchQuizRequest, fetchQuizSuccess, fetchQuizFailure, submitAnswer } = quizSlice.actions;

export default quizSlice.reducer;