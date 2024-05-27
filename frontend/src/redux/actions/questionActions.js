import axios from 'axios';
import { 
  FETCH_QUESTIONS_REQUEST, 
  FETCH_QUESTIONS_SUCCESS, 
  FETCH_QUESTIONS_FAILURE 
} from './types';

// Action to fetch questions for a specific quiz
export const fetchQuestions = (quizId) => async dispatch => {
  dispatch({ type: FETCH_QUESTIONS_REQUEST });
  try {
    const response = await axios.get(`/api/quizzes/${quizId}/questions/`);
    dispatch({ type: FETCH_QUESTIONS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_QUESTIONS_FAILURE, payload: error.message });
  }
};
