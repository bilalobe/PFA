import { createReducer } from '@reduxjs/toolkit';
import { fetchQuizRequest, fetchQuizSuccess, fetchQuizFailure, submitAnswer, resetQuiz } from './quizActions';

const initialState = {
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
        .addCase(fetchQuizSuccess, (state, action) => {
            state.quiz = action.payload;
            state.loading = false;
        })
        .addCase(fetchQuizFailure, (state, action) => {
            state.error = action.payload;
            state.loading = false;
        })
        .addCase(submitAnswer, (state, action) => {
            const { questionId, answer } = action.payload;
            state.answers[questionId] = answer;
        })
        .addCase(resetQuiz, () => initialState);
});

export default quizReducer;