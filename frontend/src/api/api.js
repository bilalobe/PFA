import axios from 'axios';

const apiUrl = 'http://localhost:8000/api/'; // Base URL for your API

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
      if (error.response.status === 400) {
        // Handle validation errors
        throw new Error(error.response.data.detail || 'An error occurred during registration. Please try again.');
      } else {
        throw error; 
      }
    }
  },
  login: async (username, password) => {
    try {
      const response = await axios.post(`${apiUrl}auth/token/`, { // Token obtain endpoint
        username,
        password,
      });
      return response.data;
    } catch (error) {
      if (error.response.status === 401) {
        throw new Error('Invalid credentials. Please check your username and password.');
      } else {
        throw error;
      }
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
      const token = localStorage.getItem('token'); // Assuming you're storing the token in localStorage 
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
      const token = localStorage.getItem('token'); // Assuming you're storing the token in localStorage 
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
      const response = await axios.post(`${apiUrl}quizzes/${quizId}/attempts/`, {
        choices: selectedAnswers
      });
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
  fetchQuizzes: async (moduleId, difficulty) => {
    try {
      let url = `${apiUrl}quizzes/`;
      if (moduleId) {
        url += `?module=${moduleId}`;
      }
      if (difficulty) {
        url += moduleId ? `&difficulty=${difficulty}` : `?difficulty=${difficulty}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
  searchQuizzes: async (searchQuery) => {
    try {
      const response = await axios.get(`${apiUrl}quizzes/?search=${searchQuery}`);
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
  startQuizAttempt: async (quizId) => {
    try {
      const response = await axios.post(`${apiUrl}quizzes/${quizId}/attempts/`);
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
  submitQuizAnswers: async (attemptId, answers) => {
    try {
      const response = await axios.post(`${apiUrl}attempts/${attemptId}/submit/`, { answers });
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
};

// Enrollment API
const enrollmentApi = {
  fetchEnrollments: async () => {
    try {
      const response = await axios.get(`${apiUrl}enrollments/`);
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
  enrollInCourse: async (courseId) => {
    try {
      const response = await axios.post(`${apiUrl}enrollments/`, { course: courseId });
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
  fetchUnenroll: async (courseId) => {
    try {
      await axios.delete(`${apiUrl}enrollments/${courseId}/`);
    } catch (error) {
      throw error; 
    }
  },
  updateProgress: async (enrollmentId, progress) => {
    try {
      const response = await axios.put(`${apiUrl}enrollments/${enrollmentId}/`, { progress });
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
      const response = await axios.post(`${apiUrl}courses/${courseId}/forums/threads/`, {
        title,
        content
      });
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
      const response = await axios.post(`${apiUrl}resources/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
          // ... authorization headers (if needed)
        },
        onUploadProgress
      });
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
};

export { authApi, userApi, courseApi, moduleApi, quizApi, enrollmentApi, forumApi, resourceApi };