import {
  FETCH_ENROLLMENTS_REQUEST,
  FETCH_ENROLLMENTS_SUCCESS,
  FETCH_ENROLLMENTS_FAILURE,
  UNENROLL_COURSE_REQUEST,
  UNENROLL_COURSE_SUCCESS,
  UNENROLL_COURSE_FAILURE,
  ENROLL_COURSE_REQUEST,
  ENROLL_COURSE_SUCCESS,
  ENROLL_COURSE_FAILURE,
  UPDATE_PROGRESS_REQUEST,
  UPDATE_PROGRESS_SUCCESS,
  UPDATE_PROGRESS_FAILURE,
} from '../actions/types';

const initialState = {
  enrollments: [],
  loading: false,
  error: null,
};

const enrollmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ENROLLMENTS_REQUEST:
    case UNENROLL_COURSE_REQUEST:
    case ENROLL_COURSE_REQUEST:
    case UPDATE_PROGRESS_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_ENROLLMENTS_SUCCESS:
      return { ...state, loading: false, enrollments: action.payload };

    case UNENROLL_COURSE_SUCCESS:
      return {
        ...state,
        loading: false,
        enrollments: state.enrollments.filter(enrollment => enrollment.course.id !== action.payload),
      };

    case ENROLL_COURSE_SUCCESS:
      return {
        ...state,
        loading: false,
        enrollments: [...state.enrollments, action.payload],
      };

    case UPDATE_PROGRESS_SUCCESS:
      return {
        ...state,
        loading: false,
        enrollments: state.enrollments.map((enrollment) =>
          enrollment.id === action.payload.id ? action.payload : enrollment
        ),
      };

    case FETCH_ENROLLMENTS_FAILURE:
    case UNENROLL_COURSE_FAILURE:
    case ENROLL_COURSE_FAILURE:
    case UPDATE_PROGRESS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default enrollmentReducer;