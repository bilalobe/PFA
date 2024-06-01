import axios from 'axios';
import {
  FETCH_COURS_REQUEST,
  FETCH_COURS_SUCCESS,
  FETCH_COURS_FAILURE,
} from './types'; // Ensure you have action types defined

const apiUrl = 'http://localhost:8000/api'; // Change to your actual API URL

export const fetchCoursRequest = () => ({
  type: FETCH_COURS_REQUEST,
});

export const fetchCoursSuccess = (cours) => ({
  type: FETCH_COURS_SUCCESS,
  payload: cours,
});

export const fetchCoursFailure = (error) => ({
  type: FETCH_COURS_FAILURE,
  payload: error,
});

export const fetchCours = () => {
  return async (dispatch) => {
    dispatch(fetchCoursRequest());
    try {
      const response = await axios.get(`${apiUrl}/cours/`);
      dispatch(fetchCoursSuccess(response.data));
    } catch (error) {
      dispatch(fetchCoursFailure(error.message));
    }
  };
};
