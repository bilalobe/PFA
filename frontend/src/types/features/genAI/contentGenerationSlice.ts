import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface GenerateRequest {
  text: string;
  type: string;
}

interface GenerateResponse {
  content: string;
}

interface ContentGenerationState {
  generatedContent: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ContentGenerationState = {
  generatedContent: null,
  loading: false,
  error: null,
};

export const generateContent = createAsyncThunk<
  GenerateResponse,
  GenerateRequest,
  { rejectValue: string }
>(
  'contentGeneration/generateContent',
  async ({ text, type }, thunkAPI) => {
    try {
      const response = await axios.post('/api/generate', { text, type });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || 'An error occurred while generating content.');
    }
  }
);

const contentGenerationSlice = createSlice({
  name: 'contentGeneration',
  initialState,
  reducers: {
    clearContent: (state) => {
      state.generatedContent = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateContent.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedContent = action.payload.content;
      })
      .addCase(generateContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearContent } = contentGenerationSlice.actions;

export default contentGenerationSlice.reducer;
