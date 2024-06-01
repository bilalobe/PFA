const initialState = {
    user: null, 
    token: null, 
    isAuthenticated: false,
    loading: false,
    error: null,
  };
  
  const authReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'LOGIN_REQUEST':
        return { ...state, loading: true };
      case 'LOGIN_SUCCESS':
        return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false };
      case 'LOGIN_FAILURE':
        return { ...state, error: action.payload, loading: false };
      case 'LOGOUT_REQUEST':
        return { ...state, loading: true };
      case 'LOGOUT_SUCCESS':
        return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
      case 'LOGOUT_FAILURE':
        return { ...state, error: action.payload, loading: false };
      default:
        return state;
    }
  };
  
  export default authReducer;