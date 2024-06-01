import axios from 'axios';

export const fetchForumPostsRequest = () => ({ type: 'FETCH_FORUM_POSTS_REQUEST' });
export const fetchForumPostsSuccess = (posts) => ({ type: 'FETCH_FORUM_POSTS_SUCCESS', payload: posts });
export const fetchForumPostsFailure = (error) => ({ type: 'FETCH_FORUM_POSTS_FAILURE', payload: error });

export const createForumPostRequest = () => ({ type: 'CREATE_FORUM_POST_REQUEST' });
export const createForumPostSuccess = (post) => ({ type: 'CREATE_FORUM_POST_SUCCESS', payload: post });
export const createForumPostFailure = (error) => ({ type: 'CREATE_FORUM_POST_FAILURE', payload: error });

export const fetchForumPosts = (courseId) => {
  return async (dispatch) => {
    dispatch(fetchForumPostsRequest());
    try {
      const response = await axios.get(`/api/courses/${courseId}/forums/`);
      dispatch(fetchForumPostsSuccess(response.data));
    } catch (error) {
      dispatch(fetchForumPostsFailure(error.message));
    }
  };
};

export const createForumPost = (courseId, title, content) => {
  return async (dispatch) => {
    dispatch(createForumPostRequest());
    try {
      const response = await axios.post(`/api/courses/${courseId}/forums/threads/`, {
        title,
        content,
      });
      dispatch(createForumPostSuccess(response.data));
    } catch (error) {
      dispatch(createForumPostFailure(error.message));
    }
  };
};