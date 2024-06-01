import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchRecommendations = createAsyncThunk(
  'adaptive/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/personalized-recommendations/');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);
