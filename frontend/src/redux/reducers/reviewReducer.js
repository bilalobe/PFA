// reviewReducer.js

import {
    FETCH_REVIEWS_REQUEST,
    FETCH_REVIEWS_SUCCESS,
    FETCH_REVIEWS_FAILURE,
  } from '../actions/types';
  
  const initialState = {
    reviews: [],
    isLoading: false,
    error: null,
  };
  
  const reviewReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_REVIEWS_REQUEST:
        return {
          ...state,
          isLoading: true,
          error: null,
        };
      case FETCH_REVIEWS_SUCCESS:
        return {
          ...state,
          isLoading: false,
          reviews: action.payload,
        };
      case FETCH_REVIEWS_FAILURE:
        return {
          ...state,
          isLoading: false,
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default reviewReducer;
  