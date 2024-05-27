import axios from 'axios';

export const FETCH_RECOMMENDATIONS_REQUEST = 'FETCH_RECOMMENDATIONS_REQUEST';
export const FETCH_RECOMMENDATIONS_SUCCESS = 'FETCH_RECOMMENDATIONS_SUCCESS';
export const FETCH_RECOMMENDATIONS_FAILURE = 'FETCH_RECOMMENDATIONS_FAILURE';

export const fetchRecommendations = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_RECOMMENDATIONS_REQUEST });
  try {
    const token = getState().auth.token;
    const response = await axios.get('/api/personalized-recommendations/', {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    dispatch({ type: FETCH_RECOMMENDATIONS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_RECOMMENDATIONS_FAILURE, payload: error.message });
  }
};
