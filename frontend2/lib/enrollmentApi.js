import axios from 'axios';

const apiUrl = 'http://localhost:8000/api/';

const getAuthToken = () => localStorage.getItem('token');

const enrollmentApi = {
  fetchEnrollments: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}enrollments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  enrollInCourse: async (courseId) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${apiUrl}enrollments/`,
        { course: courseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchUnenroll: async (courseId) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${apiUrl}enrollments/${courseId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  updateProgress: async (enrollmentId, progress) => {
    try {
      const token = getAuthToken();
      const response = await axios.put(
        `${apiUrl}enrollments/${enrollmentId}/`,
        { progress },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default enrollmentApi;
