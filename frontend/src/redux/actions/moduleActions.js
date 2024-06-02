import {
  FETCH_MODULES_REQUEST,
  FETCH_MODULES_SUCCESS,
  FETCH_MODULES_FAILURE,
} from './types';
import { moduleApi } from '../api/api';

export const fetchModules = createAsyncThunk(
  'module/fetchModules',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await moduleApi.fetchModules(courseId); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);