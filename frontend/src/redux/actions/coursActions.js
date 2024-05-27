// re_act/src/actions/coursActions.js
import axios from 'axios';

const apiUrl = 'http://localhost:8000/api'; // Adresse de votre API

export const fetchCoursRequest = () => ({
  type: 'FETCH_COURS_REQUEST',
});

export const fetchCoursSuccess = (cours) => ({
  type: 'FETCH_COURS_SUCCESS',
  payload: cours,
});

export const fetchCoursFailure = (error) => ({
  type: 'FETCH_COURS_FAILURE',
  payload: error,
});

export const fetchCours = () => {
  return async (dispatch) => {
    dispatch(fetchCoursRequest());
    try {
      const response = await axios.get(`${apiUrl}/cours/`); // Assurez-vous que l'URL de l'API est correcte
      dispatch(fetchCoursSuccess(response.data));
    } catch (error) {
      dispatch(fetchCoursFailure(error.message));
    }
  };
};