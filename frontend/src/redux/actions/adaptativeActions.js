import axios from 'axios';
import {
  FETCH_RECOMMENDATIONS_REQUEST,
  FETCH_RECOMMENDATIONS_SUCCESS,
  FETCH_RECOMMENDATIONS_FAILURE,
} from './types'; 

export const fetchRecommendations = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_RECOMMENDATIONS_REQUEST });
  try {
    const token = getState().auth.token;
    const response = await axios.get('/api/personalized-recommendations/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    dispatch({ type: FETCH_RECOMMENDATIONS_SUCCESS, payload: response.data });
  } catch (error) {
    // Handle specific error codes (e.g., 401 Unauthorized, 403 Forbidden)
    if (error.response.status === 401) {
      dispatch({ 
        type: FETCH_RECOMMENDATIONS_FAILURE, 
        payload: 'You are not authenticated. Please log in.'
      });
    } else if (error.response.status === 403) {
      dispatch({ 
        type: FETCH_RECOMMENDATIONS_FAILURE, 
        payload: 'You do not have permission to access this resource.'
      });
    } else {
      dispatch({ 
        type: FETCH_RECOMMENDATIONS_FAILURE, 
        payload: error.message 
      });
    }
    // Log the error for debugging
    console.error('Error fetching recommendations:', error);
  }
};