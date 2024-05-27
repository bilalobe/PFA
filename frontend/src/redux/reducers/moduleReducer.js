// re_act/src/reducers/moduleReducer.js
const initialState = {
    modules: [],
    isLoading: false,
    error: null,
  };
  
  const moduleReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'FETCH_MODULES_REQUEST':
        return {
          ...state,
          isLoading: true,
        };
      case 'FETCH_MODULES_SUCCESS':
        return {
          ...state,
          isLoading: false,
          modules: action.payload,
        };
      case 'FETCH_MODULES_FAILURE':
        return {
          ...state,
          isLoading: false,
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default moduleReducer;