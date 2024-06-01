import {
  FETCH_QUIZ_REQUEST,
  FETCH_QUIZ_SUCCESS,
  FETCH_QUIZ_FAILURE,
  SUBMIT_QUIZ_REQUEST,
  SUBMIT_QUIZ_SUCCESS,
  SUBMIT_QUIZ_FAILURE,
} from '../actions/types';

const initialState = {
  quiz: null,
  loading: false,
  error: null,
  success: false, // Success state for fetching
  submitSuccess: false, // Success state for submitting
  submitError: null, // Error state for submitting
  score: 0, // To store the score
};

const quizReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_QUIZ_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case FETCH_QUIZ_SUCCESS:
      return { ...state, loading: false, quiz: action.payload, success: true };
    case FETCH_QUIZ_FAILURE:
      return { ...state, loading: false, error: action.payload, success: false };
    case SUBMIT_QUIZ_REQUEST:
      return { ...state, loading: true, submitSuccess: false, submitError: null };
    case SUBMIT_QUIZ_SUCCESS:
      return { ...state, loading: false, submitSuccess: true, score: action.payload };
    case SUBMIT_QUIZ_FAILURE:
      return { ...state, loading: false, submitError: action.payload, submitSuccess: false };
    default:
      return state;
  }
};

export default quizReducer;