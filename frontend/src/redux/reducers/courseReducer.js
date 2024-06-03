import {
  FETCH_COURSES_REQUEST,
  FETCH_COURSES_SUCCESS,
  FETCH_COURSES_FAILURE,
} from '../actions/types';

const initialState = {
  courses: [],
  isLoading: false,
  error: null,
};

export default function courseReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_COURSES_REQUEST:
      return { ...state, isLoading: true, error: null };
    case FETCH_COURSES_SUCCESS:
      return { ...state, isLoading: false, courses: action.payload };
    case FETCH_COURSES_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}
