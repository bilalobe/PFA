import {
  FETCH_COURS_REQUEST,
  FETCH_COURS_SUCCESS,
  FETCH_COURS_FAILURE,
} from '../actions/types';

const initialState = {
  cours: [],
  isLoading: false,
  error: null,
};

const coursReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_COURS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null, // Reset error on new fetch request
      };
    case FETCH_COURS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        cours: action.payload,
      };
    case FETCH_COURS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default coursReducer;
