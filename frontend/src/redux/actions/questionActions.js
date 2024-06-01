import axios from 'axios';
import {
  FETCH_QUESTIONS_REQUEST,
  FETCH_QUESTIONS_SUCCESS,
  FETCH_QUESTIONS_FAILURE,
} from './types';

// Action Creators
export const fetchQuestionsRequest = () => ({ type: FETCH_QUESTIONS_REQUEST });
export const fetchQuestionsSuccess = (questions) => ({ type: FETCH_QUESTIONS_SUCCESS, payload: questions });
export const fetchQuestionsFailure = (error) => ({ type: FETCH_QUESTIONS_FAILURE, payload: error });

// Fetch Questions Action
export const fetchQuestions = (quizId) => {
  return async (dispatch) => {
    dispatch(fetchQuestionsRequest());
    try {
      const response = await axios.get(`/api/quizzes/${quizId}/questions/`); // Replace with your API endpoint
      dispatch(fetchQuestionsSuccess(response.data));
    } catch (error) {
      dispatch(fetchQuestionsFailure(error.message));
    }
  };
};