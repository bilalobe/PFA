import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const baseURL = '/api/modules/';

export const fetchModules = createAsyncThunk(
  'module/fetchModules',
  async ({ courseId, searchQuery, currentPage }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (courseId) params.append('courseId', courseId);
      if (searchQuery) params.append('search', searchQuery);
      if (currentPage) params.append('page', currentPage);

      const response = await axios.get(baseURL, { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchModuleDetails = createAsyncThunk(
  'module/fetchModuleDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/${id}/`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const moduleSlice = createSlice({
  name: 'module',
  initialState: {
    modules: [],
    selectedModule: null,
    isLoading: false,
    error: null,
    searchQuery: '',
    currentPage: 1,
    modulesPerPage: 6,
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchModuleDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModuleDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedModule = action.payload;
      })
      .addCase(fetchModuleDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchQuery, setCurrentPage } = moduleSlice.actions;
export default moduleSlice.reducer;
