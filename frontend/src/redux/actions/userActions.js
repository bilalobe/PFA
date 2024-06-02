import {
  FETCH_USER_PROFILE_REQUEST,
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_USER_PROFILE_FAILURE,
  UPDATE_USER_PROFILE_REQUEST,
  UPDATE_USER_PROFILE_SUCCESS,
  UPDATE_USER_PROFILE_FAILURE,
} from './types';
import { userApi } from '../api/api';

// Fetch user profile action
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.fetchUserProfile(); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user profile action
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUserProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);