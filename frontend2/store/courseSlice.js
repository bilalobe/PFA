// frontend2/store/courseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = 'http://localhost:8000/api';

// Create Quiz
export const createQuiz = createAsyncThunk(
    'course/createQuiz',
    async ({ courseId, quizDetails }, thunkAPI) => {
        try {
            const response = await axios.post(`/api/courses/${courseId}/quizzes/`, quizDetails);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

const courseSlice = createSlice({
    name: 'course',
    initialState: {
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createQuiz.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createQuiz.fulfilled, (state, action) => {
                state.loading = false;
                state.quiz = action.payload;
            })
            .addCase(createQuiz.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

    },
});

export default courseSlice.reducer;