import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EnrollmentState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  enrollments: any[]; // Define a more specific type based on your data structure
}

const initialState: EnrollmentState = {
  status: 'idle',
  error: null,
  enrollments: [],
};

const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState,
  reducers: {

    // Define actions like fetchEnrollments, enrollStudent, etc.
  },
  extraReducers(builder) {
    // Handle async actions here
  },
});

export const { /* export actions here */ } = enrollmentSlice.actions;

export default enrollmentSlice.reducer;