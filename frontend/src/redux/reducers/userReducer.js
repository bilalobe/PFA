import {
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
  SET_SEARCH_QUERY,
  SET_CURRENT_PAGE,
  FETCH_USER_PROFILE_REQUEST,
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_USER_PROFILE_FAILURE,
  UPDATE_USER_PROFILE_REQUEST,
  UPDATE_USER_PROFILE_SUCCESS,
  UPDATE_USER_PROFILE_FAILURE,
} from '../actions/types';

const initialState = {
  users: [],
  loading: false,
  error: null,
  searchQuery: '',
  currentPage: 1,
  usersPerPage: 9,
  profile: null, // Profile state
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USERS_REQUEST:
      return { ...state, loading: true };
    case FETCH_USERS_SUCCESS:
      return { ...state, users: action.payload, loading: false };
    case FETCH_USERS_FAILURE:
      return { ...state, error: action.payload, loading: false };
    case SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    case SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    case FETCH_USER_PROFILE_REQUEST:
      return { ...state, loading: true };
    case FETCH_USER_PROFILE_SUCCESS:
      return { ...state, profile: action.payload, loading: false };
    case FETCH_USER_PROFILE_FAILURE:
      return { ...state, error: action.payload, loading: false };
    case UPDATE_USER_PROFILE_REQUEST:
      return { ...state, loading: true };
    case UPDATE_USER_PROFILE_SUCCESS:
      return { ...state, profile: action.payload, loading: false };
    case UPDATE_USER_PROFILE_FAILURE:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export default userReducer;