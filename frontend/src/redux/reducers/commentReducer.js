import {
    FETCH_COMMENTS_REQUEST,
    FETCH_COMMENTS_SUCCESS,
    FETCH_COMMENTS_FAILURE,
    CREATE_COMMENT_REQUEST,
    CREATE_COMMENT_SUCCESS,
    CREATE_COMMENT_FAILURE,
  } from '../actions/types';
  
  const initialState = {
    comments: [],
    loading: false,
    error: null,
  };
  
  const commentReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_COMMENTS_REQUEST:
      case CREATE_COMMENT_REQUEST:
        return { ...state, loading: true };
      case FETCH_COMMENTS_SUCCESS:
        return { ...state, loading: false, comments: action.payload };
      case CREATE_COMMENT_SUCCESS:
        return { 
          ...state, 
          loading: false, 
          comments: [...state.comments, action.payload] 
        };
      case FETCH_COMMENTS_FAILURE:
      case CREATE_COMMENT_FAILURE:
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };
  
  export default commentReducer;
  