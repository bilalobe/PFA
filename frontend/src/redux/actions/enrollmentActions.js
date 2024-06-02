import axios from 'axios';
import { apiUrl } from './api';
import {
  ENROLL_COURSE_REQUEST,
  ENROLL_COURSE_SUCCESS,
  ENROLL_COURSE_FAILURE,
  FETCH_ENROLLMENTS_REQUEST,
  FETCH_ENROLLMENTS_SUCCESS,
  FETCH_ENROLLMENTS_FAILURE,
  UPDATE_PROGRESS_REQUEST,
  UPDATE_PROGRESS_SUCCESS,
  UPDATE_PROGRESS_FAILURE,
  UNENROLL_COURSE_REQUEST,
  UNENROLL_COURSE_SUCCESS,
  UNENROLL_COURSE_FAILURE,
} from './types';

// Fetch enrollments action
export const fetchEnrollmentsRequest = () => ({ type: FETCH_ENROLLMENTS_REQUEST });
export const fetchEnrollmentsSuccess = (enrollments) => ({ type: FETCH_ENROLLMENTS_SUCCESS, payload: enrollments });
export const fetchEnrollmentsFailure = (error) => ({ type: FETCH_ENROLLMENTS_FAILURE, payload: error });

export const fetchEnrollments = () => {
  return async (dispatch) => {
    dispatch(fetchEnrollmentsRequest());
    try {
      const response = await axios.get(`${apiUrl}enrollments/`);
      dispatch(fetchEnrollmentsSuccess(response.data));
    } catch (error) {
      dispatch({
        type: FETCH_ENROLLMENTS_FAILURE,
        payload: error.message,
      });
    }
  };
};

export const fetchUnenroll = (courseId) => async (dispatch) => {
  dispatch({ type: UNENROLL_COURSE_REQUEST });
  try {
    await axios.delete(`${apiUrl}enrollments/${courseId}/`);
    dispatch({ type: UNENROLL_COURSE_SUCCESS, payload: courseId });
  } catch (error) {
    dispatch({
      type: UNENROLL_COURSE_FAILURE,
      payload: error.message,
    });
  }
};

// Enroll in a course
export const enrollInCourse = (courseId) => {
  return async (dispatch) => {
    dispatch(enrollInCourseRequest());
    try {
      const response = await axios.post(`${apiUrl}enrollments/`, { course: courseId });
      dispatch(enrollInCourseSuccess(response.data));
    } catch (error) {
      dispatch(enrollInCourseFailure(error.message));
    }
  };
};

export const enrollInCourseRequest = () => ({ type: ENROLL_COURSE_REQUEST });
export const enrollInCourseSuccess = (enrollment) => ({ type: ENROLL_COURSE_SUCCESS, payload: enrollment });
export const enrollInCourseFailure = (error) => ({ type: 'ENROLL_IN_COURSE_FAILURE', payload: error.message });

export const updateProgressRequest = () => ({ type: UPDATE_PROGRESS_REQUEST });
export const updateProgressSuccess = (enrollment) => ({ type: UPDATE_PROGRESS_SUCCESS, payload: enrollment });
export const updateProgressFailure = (error) => ({ type: UPDATE_PROGRESS_FAILURE, payload: error.message });

export const updateProgress = (enrollmentId, progress) => {
  return async (dispatch) => {
    dispatch(updateProgressRequest());
    try {
      // Make a PUT request to update the enrollment progress
      const response = await axios.put(`${apiUrl}enrollments/${enrollmentId}/`, { progress });
      dispatch(updateProgressSuccess(response.data));
    } catch (error) {
      dispatch(updateProgressFailure(error.message));
    }
  };
};