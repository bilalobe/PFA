import {
  FETCH_COURSES_REQUEST,
  FETCH_COURSES_SUCCESS,
  FETCH_COURSES_FAILURE,
} from './types';
import { courseApi } from '../api/api';

export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseApi.fetchCourses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);