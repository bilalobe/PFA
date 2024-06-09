import { createSlice } from '@reduxjs/toolkit';

const globalSlice = createSlice({
  name: 'global',
  initialState: {
    error: null,
  },
  reducers: {
    setGlobalError: (state, action) => {
      state.error = action.payload;
    },
    clearGlobalError: (state) => {
      state.error = null;
    },
  },
});

export const { setGlobalError, clearGlobalError } = globalSlice.actions;
export default globalSlice.reducer;
