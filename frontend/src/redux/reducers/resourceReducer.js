import { FETCH_RESOURCES_REQUEST, FETCH_RESOURCES_SUCCESS, FETCH_RESOURCES_FAILURE } from '../actions/types';

const initialState = {
  resources: [],
  loading: false,
  error: null,
};

const resourceReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_RESOURCES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_RESOURCES_SUCCESS:
      return {
        ...state,
        loading: false,
        resources: action.payload,
      };
    case FETCH_RESOURCES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default resourceReducer;
