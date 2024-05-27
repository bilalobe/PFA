// re_act/src/reducers/coursReducer.js
const initialState = {
    cours: [],
    isLoading: false,
    error: null,
  };
  
  const coursReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'FETCH_COURS_REQUEST':
        return {
          ...state,
          isLoading: true,
        };
      case 'FETCH_COURS_SUCCESS':
        return {
          ...state,
          isLoading: false,
          cours: action.payload,
        };
      case 'FETCH_COURS_FAILURE':
        return {
          ...state,
          isLoading: false,
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default coursReducer;