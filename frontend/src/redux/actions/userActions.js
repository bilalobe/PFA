import axios from 'axios';
import {
  FETCH_USER_PROFILE_REQUEST,
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_USER_PROFILE_FAILURE,
  UPDATE_USER_PROFILE_REQUEST,
  UPDATE_USER_PROFILE_SUCCESS,
  UPDATE_USER_PROFILE_FAILURE,
} from './types';

const apiUrl = 'http://localhost:8000/api'; 

// Fetch User Profile
export const fetchUserProfile = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_USER_PROFILE_REQUEST });
  try {
    const response = await axios.get(`${apiUrl}/profile/${userId}/`);
    dispatch({ type: FETCH_USER_PROFILE_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({
      type: FETCH_USER_PROFILE_FAILURE,
      payload: error.message, 
    });
  }
};

// Update User Profile
export const updateUserProfile = (userId, updatedProfileData) => async (dispatch) => {
  dispatch({ type: UPDATE_USER_PROFILE_REQUEST });
  try {
    const response = await axios.put(`${apiUrl}/profile/${userId}/update/`, updatedProfileData);
    dispatch({ type: UPDATE_USER_PROFILE_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({
      type: UPDATE_USER_PROFILE_FAILURE,
      payload: error.message,
    });
  }
};