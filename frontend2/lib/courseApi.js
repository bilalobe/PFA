import axios from 'axios';

const apiUrl = 'http://localhost:8000/api/';

const courseApi = {
  fetchCourses: async () => {
    try {
      const response = await axios.get(`${apiUrl}courses/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchCourseDetails: async (courseId) => {
    try {
      const response = await axios.get(`${apiUrl}courses/${courseId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default courseApi;
