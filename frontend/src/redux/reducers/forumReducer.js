import { 
    FETCH_FORUM_POSTS_REQUEST, 
    FETCH_FORUM_POSTS_SUCCESS, 
    FETCH_FORUM_POSTS_FAILURE, 
    CREATE_FORUM_POST_REQUEST, 
    CREATE_FORUM_POST_SUCCESS, 
    CREATE_FORUM_POST_FAILURE 
  } from '../actions/forumActions';
  
  const initialState = {
    forumPosts: [],
    loading: false,
    error: null,
  };
  
  const forumReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_FORUM_POSTS_REQUEST:
      case CREATE_FORUM_POST_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
      case FETCH_FORUM_POSTS_SUCCESS:
        return {
          ...state,
          loading: false,
          forumPosts: action.payload,
        };
      case CREATE_FORUM_POST_SUCCESS:
        return {
          ...state,
          loading: false,
          forumPosts: [...state.forumPosts, action.payload],
        };
      case FETCH_FORUM_POSTS_FAILURE:
      case CREATE_FORUM_POST_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default forumReducer;
  