// re_act/src/actions/moduleActions.js
import axios from 'axios';

const apiUrl = 'http://localhost:8000/api'; // Adresse de votre API

export const fetchModulesRequest = () => ({
  type: 'FETCH_MODULES_REQUEST',
});

export const fetchModulesSuccess = (modules) => ({
  type: 'FETCH_MODULES_SUCCESS',
  payload: modules,
});

export const fetchModulesFailure = (error) => ({
  type: 'FETCH_MODULES_FAILURE',
  payload: error,
});

export const fetchModules = () => {
  return async (dispatch) => {
    dispatch(fetchModulesRequest());
    try {
      const response = await axios.get(`${apiUrl}/modules/`); // Assurez-vous que l'URL de l'API est correcte
      dispatch(fetchModulesSuccess(response.data));
    } catch (error) {
      dispatch(fetchModulesFailure(error.message));
    }
  };
};