import axios from 'axios';
import {
  FETCH_COURSES_REQUEST,
  FETCH_COURSES_SUCCESS,
  FETCH_COURSES_FAILURE,
  FETCH_COURSE_REQUEST,
  FETCH_COURSE_SUCCESS,
  FETCH_COURSE_FAILURE,
} from './types';

export const fetchCoursesRequest = () => ({
  type: FETCH_COURSES_REQUEST,
});

export const fetchCoursesSuccess = (courses) => ({
  type: FETCH_COURSES_SUCCESS,
  payload: courses,
});

export const fetchCoursesFailure = (error) => ({
  type: FETCH_COURSES_FAILURE,
  payload: error,
});

export const fetchCourses = () => async (dispatch) => {
  dispatch(fetchCoursesRequest());
  try {
    const response = await axios.get('/api/courses/');
    dispatch(fetchCoursesSuccess(response.data));
  } catch (error) {
    dispatch(fetchCoursesFailure(error.message));
  }
};

export const fetchCourseRequest = () => ({
  type: FETCH_COURSE_REQUEST,
});

export const fetchCourseSuccess = (course) => ({
  type: FETCH_COURSE_SUCCESS,
  payload: course,
});

export const fetchCourseFailure = (error) => ({
  type: FETCH_COURSE_FAILURE,
  payload: error,
});

export const fetchCourse = (courseId) => async (dispatch) => {
  dispatch(fetchCourseRequest());
  try {
    const response = await axios.get(`/api/courses/${courseId}/`);
    dispatch(fetchCourseSuccess(response.data));
  } catch (error) {
    dispatch(fetchCourseFailure(error.message));
  }
};
