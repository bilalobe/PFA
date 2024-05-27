import axios from 'axios';
import { FETCH_QUIZ_REQUEST, FETCH_QUIZ_SUCCESS, FETCH_QUIZ_FAILURE } from './types';

export const fetchQuiz = (quizId) => async (dispatch) => {
  dispatch({ type: FETCH_QUIZ_REQUEST });
  try {
    const response = await axios.get(`/api/quizzes/${quizId}/`);
    dispatch({ type: FETCH_QUIZ_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_QUIZ_FAILURE, payload: error.message });
  }
};
