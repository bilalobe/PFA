import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../../utils/api';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  grade: string;
  cumulativescore: number;
  role: string;
}

interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}


interface UserState {
  profile: User | null;
  all: User[];
  loading: boolean;
  sort: Sort;
}

const initialState: UserState = {
  profile: null,
  all: [],
  loading: false,
  sort: { field: '', direction: 'asc' },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.profile = null;
      state.all = [];
    },
    sortUsers: (state, action) => {
      state.sort = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logoutUser, sortUsers } = userSlice.actions;
export default userSlice.reducer;
