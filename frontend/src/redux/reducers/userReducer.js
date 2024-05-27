const initialState = {
  users: [],
  isLoading: false,
  error: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_USERS_REQUEST':
      return {
        ...state,
        isLoading: true,
      };
    case 'FETCH_USERS_SUCCESS':
      return {
        ...state,
        users: action.payload,
        isLoading: false,
      };
    case 'FETCH_USERS_FAILURE':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
  }
};

export default userReducer;
