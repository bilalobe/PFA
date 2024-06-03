import axios from 'axios';

const apiUrl = 'http://localhost:8000/api/'; // Base URL for your API

// Helper function to get the authorization token
const getAuthToken = () => localStorage.getItem('token');

// Auth API
const authApi = {
  register: async (username, email, password, userType) => {
    try {
      const response = await axios.post(`${apiUrl}auth/register/`, {
        username,
        email,
        password,
        profile: { user_type: userType },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'An error occurred during registration. Please try again.');
    }
  },
  login: async (username, password) => {
    try {
      const response = await axios.post(`${apiUrl}auth/token/`, {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Invalid credentials. Please check your username and password.');
    }
  },
  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post(`${apiUrl}auth/token/refresh/`, {
        refresh: refreshToken,
      });
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
  logout: async () => {
    try {
      // Specific logout endpoint if needed
      // await axios.post(`${apiUrl}auth/logout/`);
    } catch (error) {
      throw error; 
    }
  },
};

// User API
const userApi = {
  getProfile: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}users/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
  updateProfile: async (updatedProfileData) => {
    try {
      const token = getAuthToken();
      const response = await axios.put(`${apiUrl}users/me/`, updatedProfileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
};

// Course API
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
  // Other course API functions can be added here
};

// Module API
const moduleApi = {
  fetchModules: async (courseId) => {
    try {
      const response = await axios.get(`${apiUrl}courses/${courseId}/modules/`);
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
  // Other module API functions can be added here
};

// Quiz API
const quizApi = {
  fetchQuiz: async (quizId) => {
    try {
      const response = await axios.get(`${apiUrl}quizzes/${quizId}/`);
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
  submitQuiz: async (quizId, selectedAnswers) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${apiUrl}quizzes/${quizId}/attempts/`,
        { choices: selectedAnswers },
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
  fetchQuizzesForModule: async (moduleId) => {
    try {
      const response = await axios.get(`${apiUrl}modules/${moduleId}/quizzes/`);
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
};

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

// Forum API
const forumApi = {
  fetchForumPosts: async (courseId) => {
    try {
      const response = await axios.get(`${apiUrl}courses/${courseId}/forums/`);
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
  createForumPost: async (courseId, title, content) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${apiUrl}courses/${courseId}/forums/threads/`,
        {
          title,
          content,
        },
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

// Resource API
const resourceApi = {
  fetchResources: async (moduleId, searchQuery) => {
    try {
      let url = `${apiUrl}resources/`;
      if (moduleId) {
        url += `?module=${moduleId}`;
      }
      if (searchQuery) {
        url += moduleId ? `&search=${searchQuery}` : `?search=${searchQuery}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
  uploadResource: async (formData, onUploadProgress) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${apiUrl}resources/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress,
      });
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
};

const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    if (error.response.status === 400) {
      throw new Error(error.response.data.detail || defaultMessage);
    }
    if (error.response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
  }
  throw error;
};

export { authApi, userApi, courseApi, moduleApi, quizApi, enrollmentApi, forumApi, resourceApi };
