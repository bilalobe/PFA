const initialState = {
  forumPosts: [],
  loading: false,
  error: null,
  success: false,
};

const forumReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_FORUM_POSTS_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_FORUM_POSTS_SUCCESS':
      return { ...state, loading: false, forumPosts: action.payload };
    case 'FETCH_FORUM_POSTS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_FORUM_POST_REQUEST':
      return { ...state, loading: true, success: false }; 
    case 'CREATE_FORUM_POST_SUCCESS':
      return { ...state, loading: false, success: true, forumPosts: [...state.forumPosts, action.payload] }; 
    case 'CREATE_FORUM_POST_FAILURE':
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};

export default forumReducer;