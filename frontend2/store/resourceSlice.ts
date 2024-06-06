// frontend2/store/resourceSlice.ts
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

interface Resource {
    id: string;
    title: string;
    description: string;
    file: string;
}

interface ResourceState {
    loading: boolean;
    error: string | null;
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
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// Upload resource
export const uploadResource = createAsyncThunk<
    Resource,
    { formData: FormData; onUploadProgress: (progressEvent: ProgressEvent) => void },
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
            return thunkAPI.rejectWithValue(error.message);
        }
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
            .addCase(fetchResources.rejected, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(uploadResource.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadResource.fulfilled, (state, action: PayloadAction<Resource>) => {
                state.loading = false;
                state.resources.push(action.payload);
            })
            .addCase(uploadResource.rejected, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default resourceSlice.reducer;