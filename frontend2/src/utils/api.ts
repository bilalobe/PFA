// frontend-nextjs/utils/api.ts

import axios from 'axios';

// Replace with your actual Django backend URL (use environment variables in production)
const apiUrl = 'http://localhost:8000/api';  

// Helper function to get the authorization token
const getAuthToken = () => {
  // Adapt based on your token storage (localStorage or cookies)
  return localStorage.getItem('token'); 
};

// --- Authentication API ---
export const authApi = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${apiUrl}/auth/register/`, userData);
      return response.data;
    } catch (error) {
      throw new Error('Registration failed.');
    }
  },
  login: async (credentials) => {
    try {
      const response = await axios.post(`${apiUrl}/auth/token/`, credentials); 
      return response.data;
    } catch (error) {
      throw new Error('Invalid credentials.');
    }
  },
  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post(`${apiUrl}/auth/token/refresh/`, {
        refresh: refreshToken,
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to refresh token.');
    }
  },
  logout: async () => {
    // ... add logic if you have a specific API endpoint for logout
  },
};

// --- User API ---
export const userApi = {
  getProfile: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/users/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user profile.');
    }
  },
  updateProfile: async (updatedProfileData) => {
    try {
      const token = getAuthToken();
      const response = await axios.put(`${apiUrl}/users/me/`, updatedProfileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update profile.');
    }
  },
};

// --- Course API ---
export const courseApi = {
  fetchCourses: async () => {
    try {
      const response = await axios.get(`${apiUrl}/courses/`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch courses.');
    }
  },
    fetchCourseDetails: async (courseId) => {
        try {
            const response = await axios.get(`${apiUrl}/courses/${courseId}/`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch details for course ${courseId}.`);
        }
    },
    // ... (other course API functions)
};

// --- Module API ---
export const moduleApi = {
        fetchModules: async (courseId) => {
                try {
                        const response = await axios.get(`${apiUrl}/courses/${courseId}/modules/`);
                        return response.data;
                } catch (error) {
                        throw new Error(`Failed to fetch modules for course ${courseId}.`);
                }
        },
        // ... (other module API functions)
};

// --- Quiz API ---
export const quizApi = {
    fetchQuiz: async (quizId) => {
        try {
            const response = await axios.get(`${apiUrl}/quizzes/${quizId}/`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch quiz ${quizId}.`);
        }
    },
    fetchQuizQuestions: async (quizId) => {
        try {
            const response = await axios.get(`${apiUrl}/quizzes/${quizId}/questions/`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch questions for quiz ${quizId}.`);
        }
    },
    submitQuiz: async (quizId, selectedAnswers) => {
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${apiUrl}/quizzes/${quizId}/submit/`, 
                { answers: selectedAnswers }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data; 
        } catch (error) {
            throw new Error(`Failed to submit quiz ${quizId}.`);
        }
    },
    // ... other quiz API functions
};

// --- Enrollment API ---
export const enrollmentApi = {
    fetchEnrollments: async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${apiUrl}/enrollments/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch enrollments.');
        }
    },
    enrollInCourse: async (courseId) => {
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${apiUrl}/enrollments/`, 
                { course: courseId }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data; 
        } catch (error) {
            throw new Error(`Failed to enroll in course ${courseId}.`);
        }
    },
    unenrollFromCourse: async (courseId) => {
        try {
            const token = getAuthToken();
            await axios.delete(`${apiUrl}/enrollments/${courseId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            throw new Error(`Failed to unenroll from course ${courseId}.`);
        }
    },
    updateProgress: async (enrollmentId, progress) => {
        try {
            const token = getAuthToken();
            const response = await axios.put(
                `${apiUrl}/enrollments/${enrollmentId}/`,
                { progress },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data; 
        } catch (error) {
            throw new Error(`Failed to update progress for enrollment ${enrollmentId}.`);
        }
    },
};

// --- Forum API ---
export const forumApi = {
    fetchForumPosts: async (courseId) => {
        try {
            const response = await axios.get(`${apiUrl}/courses/${courseId}/forums/`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch forum posts for course ${courseId}.`);
        }
    },
    createForumPost: async (courseId, threadData) => { 
        try {
            const token = getAuthToken(); 
            const response = await axios.post(
                `${apiUrl}/courses/${courseId}/forums/threads/`, 
                threadData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create a forum post in course ${courseId}.`); 
        }
    },
    fetchForumThreads: async (forumId) => {
        try {
            const response = await axios.get(`${apiUrl}/forums/${forumId}/threads/`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch threads for forum ${forumId}.`);
        }
    },
    createForumThread: async (forumId, threadData) => {
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${apiUrl}/forums/${forumId}/threads/`, 
                threadData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create a thread in forum ${forumId}.`);
        }
    },
    fetchForumPostsForThread: async (threadId) => {
        try {
            const response = await axios.get(`${apiUrl}/threads/${threadId}/posts/`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch posts for thread ${threadId}.`);
        }
    },
    createForumPostForThread: async (threadId, postData) => {
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${apiUrl}/threads/${threadId}/posts/`, 
                postData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create a post in thread ${threadId}.`);
        }
    },
    reportForumPost: async (postId, reason) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${apiUrl}/moderation/`, 
        { postId, reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; 
    } catch (error) {
      throw new Error(`Failed to report post ${postId}.`); 
    }
  },
  // ... other forum API functions
};

// --- Resource API ---
export const resourceApi = {
  fetchResources: async (moduleId, searchQuery) => {
    try {
      let url = `${apiUrl}/resources/`;
      if (moduleId) {
        url += `?module=${moduleId}`;
      }
      if (searchQuery) {
        url += moduleId ? `&search=${searchQuery}` : `?search=${searchQuery}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch resources.');
    }
  },
  uploadResource: async (formData, onUploadProgress) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${apiUrl}/resources/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress,
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to upload resource.');
    }
  },
  // ... other resource API functions
};

// --- Error Handling ---
const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error:', error.response.data);
    throw new Error(error.response.data.detail || defaultMessage);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Request Error:', error.request);
    throw new Error('No response received from the server.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error:', error.message);
    throw new Error(defaultMessage);
  }
};

export { handleApiError }; 