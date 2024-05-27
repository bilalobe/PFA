import axios from 'axios';
const apiUrl = 'http://localhost:8000/api';

// Action types
export const ENROLL_COURSE_REQUEST = 'ENROLL_COURSE_REQUEST';
export const ENROLL_COURSE_SUCCESS = 'ENROLL_COURSE_SUCCESS';
export const ENROLL_COURSE_FAILURE = 'ENROLL_COURSE_FAILURE';
export const FETCH_ENROLLMENTS_REQUEST = 'FETCH_ENROLLMENTS_REQUEST';
export const FETCH_ENROLLMENTS_SUCCESS = 'FETCH_ENROLLMENTS_SUCCESS';
export const FETCH_ENROLLMENTS_FAILURE = 'FETCH_ENROLLMENTS_FAILURE';
// Other action types for updating progress, marking as complete

// Enroll in a course
export const enrollInCourse = (courseId) => {
  return async (dispatch) => {
    dispatch({ type: ENROLL_COURSE_REQUEST });
    try {
      const response = await axios.post(`${apiUrl}/enrollments/`, { course: courseId });
      dispatch({ type: ENROLL_COURSE_SUCCESS, payload: response.data });
      // Update UI or navigate if needed
    } catch (error) {
      dispatch({ type: ENROLL_COURSE_FAILURE, payload: error.message });
    }
  };
};

// Fetch enrollments
export const fetchEnrollments = () => {
  return async (dispatch) => {
    dispatch({ type: FETCH_ENROLLMENTS_REQUEST });
    try {
      const response = await axios.get(`${apiUrl}/enrollments/`);
      dispatch({ type: FETCH_ENROLLMENTS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_ENROLLMENTS_FAILURE, payload: error.message });
    }
  };
};

