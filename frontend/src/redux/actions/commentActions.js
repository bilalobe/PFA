import axios from 'axios';
import {
  FETCH_COMMENTS_REQUEST,
  FETCH_COMMENTS_SUCCESS,
  FETCH_COMMENTS_FAILURE,
  CREATE_COMMENT_REQUEST,
  CREATE_COMMENT_SUCCESS,
  CREATE_COMMENT_FAILURE,
} from './types';

export const fetchComments = (postId) => async (dispatch) => {
  dispatch({ type: FETCH_COMMENTS_REQUEST });
  try {
    const response = await axios.get(`/api/posts/${postId}/comments`);
    dispatch({ type: FETCH_COMMENTS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_COMMENTS_FAILURE, payload: error.message });
  }
};

export const createComment = (commentData) => async (dispatch) => {
  dispatch({ type: CREATE_COMMENT_REQUEST });
  try {
    const response = await axios.post(`/api/posts/${commentData.postId}/comments`, commentData);
    dispatch({ type: CREATE_COMMENT_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: CREATE_COMMENT_FAILURE, payload: error.message });
  }
};
