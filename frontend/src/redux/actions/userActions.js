import axios from 'axios';
import {
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
  SET_SEARCH_QUERY,
  SET_CURRENT_PAGE,
  FETCH_USER_PROFILE_REQUEST,
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_USER_PROFILE_FAILURE,
  UPDATE_USER_PROFILE_REQUEST,
  UPDATE_USER_PROFILE_SUCCESS,
  UPDATE_USER_PROFILE_FAILURE,
} from './types';

const apiUrl = 'http://localhost:8000/api'; // Adjust the URL as needed

// Fetch users action
export const fetchUsersRequest = () => ({ type: FETCH_USERS_REQUEST });
export const fetchUsersSuccess = (users) => ({ type: FETCH_USERS_SUCCESS, payload: users });
export const fetchUsersFailure = (error) => ({ type: FETCH_USERS_FAILURE, payload: error.message });

export const fetchUsers = (searchQuery) => {
  return async (dispatch) => {
    dispatch(fetchUsersRequest());
    try {
      const response = await axios.get(`${apiUrl}/utilisateurs/`, {
        params: {
          search: searchQuery,
        },
      });
      dispatch(fetchUsersSuccess(response.data));
    } catch (error) {
      dispatch(fetchUsersFailure(error.message));
    }
  };
};

// Set search query action
export const setSearchQuery = (searchQuery) => ({ type: SET_SEARCH_QUERY, payload: searchQuery });

// Set current page action
export const setCurrentPage = (currentPage) => ({ type: SET_CURRENT_PAGE, payload: currentPage });

// Fetch user profile action
export const fetchUserProfileRequest = () => ({ type: FETCH_USER_PROFILE_REQUEST });
export const fetchUserProfileSuccess = (profile) => ({ type: FETCH_USER_PROFILE_SUCCESS, payload: profile });
export const fetchUserProfileFailure = (error) => ({ type: FETCH_USER_PROFILE_FAILURE, payload: error.message });

export const fetchUserProfile = () => {
  return async (dispatch) => {
    dispatch(fetchUserProfileRequest());
    try {
      const response = await axios.get(`${apiUrl}/profiles/me/`);
      dispatch(fetchUserProfileSuccess(response.data));
    } catch (error) {
      dispatch(fetchUserProfileFailure(error.message));
    }
  };
};

// Update user profile action
export const updateUserProfileRequest = () => ({ type: UPDATE_USER_PROFILE_REQUEST });
export const updateUserProfileSuccess = (profile) => ({ type: UPDATE_USER_PROFILE_SUCCESS, payload: profile });
export const updateUserProfileFailure = (error) => ({ type: UPDATE_USER_PROFILE_FAILURE, payload: error.message });

export const updateUserProfile = (profileData) => {
  return async (dispatch) => {
    dispatch(updateUserProfileRequest());
    try {
      const response = await axios.put(`${apiUrl}/profiles/me/`, profileData);
      dispatch(updateUserProfileSuccess(response.data));
    } catch (error) {
      dispatch(updateUserProfileFailure(error.message));
    }
  };
};