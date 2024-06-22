import { apiUrl } from '@/utils/api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

interface CourseDetails {
  id: string;
  title: string;
  description: string;
}

interface CourseState {
  loading: boolean;
  error: string | null;
  courses?: CourseDetails[];
  searchResults?: CourseDetails[];
}

export const fetchCourse = createAsyncThunk<CourseDetails[], undefined, { rejectValue: string }>(
  'course/fetchCourse',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get<CourseDetails[]>(`${apiUrl}/courses/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // More specific error handling if needed
        return thunkAPI.rejectWithValue(error.response?.data || 'An unknown error occurred');
      }
      return thunkAPI.rejectWithValue('An unknown error occurred');
    }
  }
);

export const searchCourse = createAsyncThunk<CourseDetails[], string, { rejectValue: string }>(
  'course/searchCourse',
  async (searchTerm, thunkAPI) => {
    try {
      const response = await axios.get<CourseDetails[]>(`${apiUrl}/courses/search?query=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // More specific error handling if needed
        return thunkAPI.rejectWithValue(error.response?.data || 'An unknown error occurred');
      }
      return thunkAPI.rejectWithValue('An unknown error occurred');
    }
  }
);

const courseSlice = createSlice({
  name: 'course',
  initialState: {
    loading: false,
    error: null,
    courses: [],
    searchResults: [],
  } as CourseState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourse.fulfilled, (state, action: PayloadAction<CourseDetails[]>) => {
        state.loading = false;
        state.courses = action.payload;
      })
.addCase(fetchCourse.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'An unknown error occurred';
      })
      .addCase(searchCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchCourse.fulfilled, (state, action: PayloadAction<CourseDetails[]>) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchCourse.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'An unknown error occurred';
      });
  },
});

export const { actions, reducer } = courseSlice;
export default reducer;