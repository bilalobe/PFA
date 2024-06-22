import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DiscussionState {
  discussions: any[]; // Define a more specific type for discussions
  loading: boolean;
  error?: string;
}

const initialState: DiscussionState = {
  discussions: [],
  loading: false,
};

const discussionForumSlice = createSlice({
  name: 'discussionForum',
  initialState,
  reducers: {
    fetchDiscussionsRequest: (state) => {
      state.loading = true;
    },
    fetchDiscussionsSuccess: (state, action: PayloadAction<any[]>) => {
      state.discussions = action.payload;
      state.loading = false;
    },
    fetchDiscussionsFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { fetchDiscussionsRequest, fetchDiscussionsSuccess, fetchDiscussionsFailure } = discussionForumSlice.actions;

export default discussionForumSlice.reducer;