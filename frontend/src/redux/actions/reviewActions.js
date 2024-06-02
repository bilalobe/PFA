// reviewActions.js

import axios from 'axios';
import {
  FETCH_REVIEWS_REQUEST,
  FETCH_REVIEWS_SUCCESS,
  FETCH_REVIEWS_FAILURE,
} from './types';

export const fetchReviewsRequest = () => ({
  type: FETCH_REVIEWS_REQUEST,
});

export const fetchReviewsSuccess = (reviews) => ({
  type: FETCH_REVIEWS_SUCCESS,
  payload: reviews,
});

export const fetchReviewsFailure = (error) => ({
  type: FETCH_REVIEWS_FAILURE,
  payload: error,
});

export const fetchReviews = (courseId) => async (dispatch) => {
  dispatch(fetchReviewsRequest());
  try {
    const response = await axios.get(`/api/courses/${courseId}/reviews/`);
    dispatch(fetchReviewsSuccess(response.data));
  } catch (error) {
    dispatch(fetchReviewsFailure(error.message));
  }
};
