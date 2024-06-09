import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuizState {
  quiz: any; // replace 'any' with the type of your quiz
  answers: { [key: string]: string };
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
    calculateScore: (state) => {
      // Here you should implement the logic for calculating the score based on the answers
      // For now, let's just count the number of answers
      state.score = Object.keys(state.answers).length;
      
    },
    resetQuiz: (state) => {
      state.score = 0;
      state.answers = {};
    },
  },
});

export const { fetchQuizRequest, fetchQuizSuccess, fetchQuizFailure, submitAnswer, calculateScore, resetQuiz } = quizSlice.actions;

export default quizSlice.reducer;