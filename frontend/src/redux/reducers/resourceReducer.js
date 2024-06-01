import {
  UPLOAD_RESOURCE_REQUEST,
  UPLOAD_RESOURCE_SUCCESS,
  UPLOAD_RESOURCE_FAILURE,
  FETCH_RESOURCES_REQUEST,
  FETCH_RESOURCES_SUCCESS,
  FETCH_RESOURCES_FAILURE,
} from '../actions/types';

const initialState = {
  resources: [],
  loading: false,
  error: null,
  success: false,
};

const resourceReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_RESOURCES_REQUEST:
    case UPLOAD_RESOURCE_REQUEST:
      return { ...state, loading: true };

    case FETCH_RESOURCES_SUCCESS:
      return { ...state, loading: false, resources: action.payload };

    case UPLOAD_RESOURCE_SUCCESS:
      return { ...state, loading: false, success: true, resources: [...state.resources, action.payload] };

    case FETCH_RESOURCES_FAILURE:
    case UPLOAD_RESOURCE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default resourceReducer;
