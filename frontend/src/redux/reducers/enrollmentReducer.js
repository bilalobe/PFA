import { 
    ENROLL_COURSE_REQUEST, 
    ENROLL_COURSE_SUCCESS, 
    ENROLL_COURSE_FAILURE, 
    FETCH_ENROLLMENTS_REQUEST, 
    FETCH_ENROLLMENTS_SUCCESS, 
    FETCH_ENROLLMENTS_FAILURE,
    UPDATE_PROGRESS_REQUEST,
    UPDATE_PROGRESS_SUCCESS,
    UPDATE_PROGRESS_FAILURE 
  } from '../actions/enrollmentActions';
  
  const initialState = {
    enrollments: [],
    loading: false,
    error: null,
  };
  
  const enrollmentReducer = (state = initialState, action) => {
    switch (action.type) {
      case ENROLL_COURSE_REQUEST:
      case FETCH_ENROLLMENTS_REQUEST:
      case UPDATE_PROGRESS_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
      case ENROLL_COURSE_SUCCESS:
        return {
          ...state,
          loading: false,
          enrollments: [...state.enrollments, action.payload],
        };
      case FETCH_ENROLLMENTS_SUCCESS:
        return {
          ...state,
          loading: false,
          enrollments: action.payload,
        };
      case ENROLL_COURSE_FAILURE:
      case FETCH_ENROLLMENTS_FAILURE:
      case UPDATE_PROGRESS_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      case UPDATE_PROGRESS_SUCCESS:
        return {
          ...state,
          loading: false,
          enrollments: state.enrollments.map(enrollment =>
            enrollment.id === action.payload.id ? action.payload : enrollment
          ),
        };
      default:
        return state;
    }
  };
  
  export default enrollmentReducer;
  