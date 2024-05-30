// frontend/src/reducers/resourceReducer.js
const initialState = {
  resources: [],
  loading: false,
  error: null,
  success: false, // Add success state
};

const resourceReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_RESOURCES_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_RESOURCES_SUCCESS':
      return { ...state, loading: false, resources: action.payload };
    case 'FETCH_RESOURCES_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'UPLOAD_RESOURCE_REQUEST':
      return { ...state, loading: true, success: false }; // Reset success state
    case 'UPLOAD_RESOURCE_SUCCESS':
      return { ...state, loading: false, success: true, resources: [...state.resources, action.payload] }; // Update resources
    case 'UPLOAD_RESOURCE_FAILURE':
      return { ...state, loading: false, error: action.payload, success: false }; 
    default:
      return state;
  }
};

export default resourceReducer;