// frontend2/src/redux/actions/quizActions.ts

import { createAction, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import error from 'next/error';

export const fetchQuizRequest = createAction('quiz/fetchQuizRequest');
export const fetchQuizSuccess = createAction<any>('quiz/fetchQuizSuccess'); // replace 'any' with the type of your quiz
export const fetchQuizFailure = createAction<string>('quiz/fetchQuizFailure');

export const resetQuiz = createAction('quiz/resetQuiz');

export const fetchQuiz = (quizId: string) => async (dispatch: (arg0: { payload: any; type: string; }) => void) => {
  dispatch(fetchQuizRequest());
  try {
    const response = await axios.get(`/api/quizzes/${quizId}`);
    dispatch(fetchQuizSuccess(response.data));
  } catch (error) {
    dispatch(fetchQuizFailure(error.message));
  }
};

interface SubmitAnswerPayload {
  questionId: string;
  answer: any; // replace 'any' with the type of your answer
}

export const submitAnswer = createAction<SubmitAnswerPayload>('quiz/submitAnswer');

export const calculateScoreRequest = createAction('quiz/calculateScoreRequest');
export const calculateScoreSuccess = createAction<number>('quiz/calculateScoreSuccess'); // replace 'number' with the type of your score
export const calculateScoreFailure = createAction<string>('quiz/calculateScoreFailure');

export const calculateScore = (answers: any) => async (dispatch: (arg0: { payload: string | number | undefined; type: string; }) => void) => { // replace 'any' with the type of your answers
  dispatch(calculateScoreRequest());
  try {
    const response = await axios.post(`/api/quizzes/calculateScore`, answers);
    dispatch(calculateScoreSuccess(response.data));
  } catch (error) {
    dispatch(calculateScoreFailure(error.message));
  }
};

export type QuizActionTypes = PayloadAction<any> | PayloadAction<string> | PayloadAction<SubmitAnswerPayload> | PayloadAction<number>; // replace 'any', 'number' with the types of your quiz, score