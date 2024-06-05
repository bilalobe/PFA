import { createAction } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchQuizRequest = createAction('quiz/fetchQuizRequest');
export const fetchQuizSuccess = createAction('quiz/fetchQuizSuccess');
export const fetchQuizFailure = createAction('quiz/fetchQuizFailure');

export const resetQuiz = createAction('quiz/resetQuiz');

export const fetchQuiz = (quizId) => async (dispatch) => {
    dispatch(fetchQuizRequest());
    try {
        const response = await axios.get(`/api/quizzes/${quizId}`);
        dispatch(fetchQuizSuccess(response.data));
    } catch (error) {
        dispatch(fetchQuizFailure(error.message));
    }
};

export const submitAnswer = createAction('quiz/submitAnswer', (questionId, answer) => ({
    payload: {
        questionId,
        answer,
    },
}));

export const calculateScoreRequest = createAction('quiz/calculateScoreRequest');
export const calculateScoreSuccess = createAction('quiz/calculateScoreSuccess');
export const calculateScoreFailure = createAction('quiz/calculateScoreFailure');

export const calculateScore = (answers) => async (dispatch) => {
    dispatch(calculateScoreRequest());
    try {
        const response = await axios.post(`/api/quizzes/calculateScore`, answers);
        dispatch(calculateScoreSuccess(response.data));
    } catch (error) {
        dispatch(calculateScoreFailure(error.message));
    }
};