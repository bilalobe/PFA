import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/api';

// Login action
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials.username, credentials.password);
      return { user: response.data.user, token: response.data.access }; // Return user and token
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Logout Action
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // ... (Optional: Send a request to your API to invalidate the token)
      await authApi.logout();
      return null; // Return nothing if logout is successful
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
