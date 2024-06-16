import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosProgressEvent } from 'axios';
import { AppError } from '@/types/ErrorType';

interface Resource {
  id: string;
  title: string;
  description: string;
  file: string;
}

interface ResourceState {
  loading: boolean;
  error: AppError | null;
  resources: Resource[];
}

const initialState: ResourceState = {
  loading: false,
  error: null,
  resources: [],
};

const apiUrl = 'http://localhost:8000/api';

// Fetch resources
export const fetchResources = createAsyncThunk<
  Resource[],
  { moduleId?: string; searchQuery?: string },
  { rejectValue: string }
>(
  'resource/fetchResources',
  async ({ moduleId, searchQuery }, thunkAPI) => {
    try {
      let url = `${apiUrl}/resources/`;
      if (moduleId) {
        url += `?module=${moduleId}`;
      }
      if (searchQuery) {
        url += moduleId ? `&search=${searchQuery}` : `?search=${searchQuery}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue((error as any).message ? (error as any).message : "An unknown error occurred");    }
  }
);

// Upload resource
export const uploadResource = createAsyncThunk<
  Resource,
  { formData: FormData; onUploadProgress: (progressEvent: AxiosProgressEvent) => void },
  { rejectValue: string }
>(
  'resource/uploadResource',
  async ({ formData, onUploadProgress }, thunkAPI) => {
    try {
      const response = await axios.post(`${apiUrl}/resources/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add authorization headers if needed
        },
        onUploadProgress,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue((error as any).message ? (error as any).message : "An unknown error occurred");    }
  }
);

const resourceSlice = createSlice({
  name: 'resource',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action: PayloadAction<Resource[]>) => {
        state.loading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ? { message: action.payload } : null;
      })
      .addCase(uploadResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadResource.fulfilled, (state, action: PayloadAction<Resource>) => {
        state.loading = false;
        state.resources.push(action.payload);
      })
      .addCase(uploadResource.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ? { message: action.payload } : null;
      });
  },
});

export default resourceSlice.reducer;
