import {
    FETCH_RECOMMENDATIONS_REQUEST,
    FETCH_RECOMMENDATIONS_SUCCESS,
    FETCH_RECOMMENDATIONS_FAILURE,
  } from '../actions/adaptiveActions';
  
  const initialState = {
    recommendations: [],
    loading: false,
    error: null,
  };
  
  const adaptiveReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_RECOMMENDATIONS_REQUEST:
        return { ...state, loading: true, error: null };
      case FETCH_RECOMMENDATIONS_SUCCESS:
        return { ...state, loading: false, recommendations: action.payload };
      case FETCH_RECOMMENDATIONS_FAILURE:
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };
  
  export default adaptiveReducer;
  