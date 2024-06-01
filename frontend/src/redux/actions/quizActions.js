import axios from 'axios';
import {
  FETCH_QUIZ_REQUEST,
  FETCH_QUIZ_SUCCESS,
  FETCH_QUIZ_FAILURE,
  SUBMIT_QUIZ_REQUEST,
  SUBMIT_QUIZ_SUCCESS,
  SUBMIT_QUIZ_FAILURE,
} from './types'; 

// Fetch Quiz Action
export const fetchQuiz = (quizId) => async (dispatch) => {
  dispatch(fetchQuizRequest());
  try {
    const response = await axios.get(`/api/quizzes/${quizId}/`);
    dispatch(fetchQuizSuccess(response.data));
  } catch (error) {
    dispatch(fetchQuizFailure(error.message));
  }
};

// Submit Quiz Action
export const submitQuiz = (quizId, selectedAnswers) => async (dispatch) => {
  dispatch(submitQuizRequest());
  try {
    const response = await axios.post(`/api/quizzes/${quizId}/attempts/`, {
      choices: selectedAnswers,
    });
    dispatch(submitQuizSuccess(response.data));
  } catch (error) {
    dispatch(submitQuizFailure(error.message));
  }
};

// Action Creators
export const fetchQuizRequest = () => ({ type: FETCH_QUIZ_REQUEST });
export const fetchQuizSuccess = (quiz) => ({ type: FETCH_QUIZ_SUCCESS, payload: quiz });
export const fetchQuizFailure = (error) => ({ type: FETCH_QUIZ_FAILURE, payload: error });

export const submitQuizRequest = () => ({ type: SUBMIT_QUIZ_REQUEST });
export const submitQuizSuccess = (score) => ({ type: SUBMIT_QUIZ_SUCCESS, payload: score });
export const submitQuizFailure = (error) => ({ type: SUBMIT_QUIZ_FAILURE, payload: error });
