// frontend2/src/redux/reducers/quizReducers.ts

import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { fetchQuizRequest, fetchQuizSuccess, fetchQuizFailure, submitAnswer, resetQuiz, QuizActionTypes } from './quizActions';

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

const quizReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchQuizRequest, (state) => {
      state.loading = true;
    })
    .addCase(fetchQuizSuccess, (state, action: PayloadAction<any>) => { // replace 'any' with the type of your quiz
      state.quiz = action.payload;
      state.loading = false;
    })
    .addCase(fetchQuizFailure, (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    })
    .addCase(submitAnswer, (state, action: PayloadAction<{ questionId: string, answer: any }>) => { // replace 'any' with the type of your answer
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
    })
    .addCase(resetQuiz, () => initialState);
});

export default quizReducer;