import {
  FETCH_RESOURCES_REQUEST,
  FETCH_RESOURCES_SUCCESS,
  FETCH_RESOURCES_FAILURE,
  SET_SEARCH_QUERY,
  SET_CURRENT_PAGE,
} from '../actions/types';

const initialState = {
  resources: [],
  loading: false,
  error: null,
  searchQuery: '',
  currentPage: 1,
  resourcesPerPage: 9,
};

export default function resourceReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_RESOURCES_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_RESOURCES_SUCCESS:
      return { ...state, loading: false, resources: action.payload };
    case FETCH_RESOURCES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    case SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    default:
      return state;
  }
}
