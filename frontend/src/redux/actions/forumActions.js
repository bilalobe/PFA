import axios from 'axios';
const apiUrl = 'http://localhost:8000/api';

// Action types
export const FETCH_FORUM_POSTS_REQUEST = 'FETCH_FORUM_POSTS_REQUEST';
export const FETCH_FORUM_POSTS_SUCCESS = 'FETCH_FORUM_POSTS_SUCCESS';
export const FETCH_FORUM_POSTS_FAILURE = 'FETCH_FORUM_POSTS_FAILURE';
export const CREATE_FORUM_POST_REQUEST = 'CREATE_FORUM_POST_REQUEST';
export const CREATE_FORUM_POST_SUCCESS = 'CREATE_FORUM_POST_SUCCESS';
export const CREATE_FORUM_POST_FAILURE = 'CREATE_FORUM_POST_FAILURE';
// More action types for comments

// Fetch forum posts
export const fetchForumPosts = (courseId) => async dispatch => {
  dispatch({ type: FETCH_FORUM_POSTS_REQUEST });
  try {
    const response = await axios.get(`${apiUrl}/forum-posts/?course=${courseId}`);
    dispatch({ type: FETCH_FORUM_POSTS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_FORUM_POSTS_FAILURE, payload: error.message });
  }
};

// Create a new forum post
export const createForumPost = (courseId, title, content) => async dispatch => {
  dispatch({ type: CREATE_FORUM_POST_REQUEST });
  try {
    const response = await axios.post(`${apiUrl}/forum-posts/`, { course: courseId, title, content });
    dispatch({ type: CREATE_FORUM_POST_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: CREATE_FORUM_POST_FAILURE, payload: error.message });
  }
};

// Similar actions for comments
