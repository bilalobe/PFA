import axios from 'axios';
import { FETCH_RESOURCES_REQUEST, FETCH_RESOURCES_SUCCESS, FETCH_RESOURCES_FAILURE } from './types';

export const fetchResources = (moduleId) => async dispatch => {
  dispatch({ type: FETCH_RESOURCES_REQUEST });
  try {
    const response = await axios.get(`/api/modules/${moduleId}/resources/`);
    dispatch({ type: FETCH_RESOURCES_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_RESOURCES_FAILURE, payload: error.message });
  }
};
