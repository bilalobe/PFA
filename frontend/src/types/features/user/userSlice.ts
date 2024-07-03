import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as firebaseConfig from '../../../../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    if (!firebaseConfig.auth.currentUser) return rejectWithValue('No user logged in');
    try {
      const docRef = doc(firebaseConfig.db, 'users', firebaseConfig.auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserInfo;
      } else {
        return rejectWithValue('No profile found');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData: UserInfo, { rejectWithValue }) => {
    if (!firebaseConfig.auth.currentUser) return rejectWithValue('No user logged in');
    try {
      const userRef = doc(firebaseConfig.db, 'users', firebaseConfig.auth.currentUser.uid);
      await updateDoc(userRef, userData);
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  grade: string;
  cumulativescore: number;
  role: string;
  [x: string]: any;
}

interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

interface UserState {
  profile: UserInfo | null;
  all: UserInfo[];
  loading: boolean;
  sort: Sort;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  all: [],
  loading: false,
  sort: { field: '', direction: 'asc' },
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.profile = null;
      state.all = [];
      state.error = null;
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
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logoutUser, sortUsers } = userSlice.actions;
export default userSlice.reducer;