import {
  FETCH_COURSES_REQUEST,
  FETCH_COURSES_SUCCESS,
  FETCH_COURSES_FAILURE,
  FETCH_COURSE_REQUEST,
  FETCH_COURSE_SUCCESS,
  FETCH_COURSE_FAILURE,
} from '../actions/types';

const initialState = {
  courses: [],
  course: null,
  isLoading: false,
  error: null,
};

const courseReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_COURSES_REQUEST:
    case FETCH_COURSE_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case FETCH_COURSES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        courses: action.payload,
      };
    case FETCH_COURSE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        course: action.payload,
      };
    case FETCH_COURSES_FAILURE:
    case FETCH_COURSE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default courseReducer;
