import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  grade: string;
  cumulativescore: number;
}

interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

interface UserState {
  all: User[];
  loading: boolean;
  sort: Sort;
}

const initialState: UserState = {
  all: [],
  loading: false,
  sort: { field: '', direction: 'asc' },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchUsersRequest: (state) => {
      state.loading = true;
    },
    fetchUsersSuccess: (state, action: PayloadAction<User[]>) => {
      state.all = action.payload;
      state.loading = false;
    },
    fetchUsersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
    },
    sortUsers: (state, action: PayloadAction<Sort>) => {
      state.sort = action.payload;
    },
    // Add other reducers here
  },
});

export const { fetchUsersRequest, fetchUsersSuccess, fetchUsersFailure, sortUsers } = userSlice.actions;

export default userSlice.reducer;