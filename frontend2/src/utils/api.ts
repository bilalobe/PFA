import axios from 'axios';
import { send } from 'process';

// Replace with your actual Django backend URL (use environment variables in production)
export const apiUrl = 'http://localhost:8000/api';

// Helper function to get the authorization token
const getAuthToken = () => {
  // Adapt based on your token storage (localStorage or cookies)
  return localStorage.getItem('token');
};

// --- Error Handling ---
const handleApiError = (error: any, defaultMessage?: string) => {
  if (error.response) {
    const { status, data } = error.response;

    // Customized error messages for different status codes
    switch (status) {
      case 400:
        throw new Error(data.detail || 'Bad Request. Please check your input.');
      case 401:
        throw new Error('Unauthorized. Please log in again.');
      case 403:
        throw new Error('Forbidden. You do not have permission to access this resource.');
      case 404:
        throw new Error('Not Found. The requested resource was not found.');
      case 500:
        throw new Error('Internal Server Error. Please try again later.');
      default:
        throw new Error(data.detail || defaultMessage || 'An unexpected error occurred.');
    }
  } else if (error.request) {
    throw new Error('No response received from the server.');
  } else {
    throw new Error(defaultMessage || 'An unknown error occurred.');
  }
};

// --- API Function Structure ---

// Auth API
export const authApi = {
  register: async (userData: any) => {
    try {
      const response = await axios.post(`${apiUrl}/auth/register/`, userData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Registration failed.');
    }
  },
  login: async (credentials: any) => {
    try {
      const response = await axios.post(`${apiUrl}/auth/token/`, credentials);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Invalid credentials.');
    }
  },
  refreshToken: async (refreshToken: any) => {
    try {
      const response = await axios.post(`${apiUrl}/auth/token/refresh/`, { refresh: refreshToken });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to refresh token.');
    }
  },
  logout: async () => {
    try {
      await axios.post(`${apiUrl}/auth/logout/`);
    } catch (error) {
      handleApiError(error, 'Logout failed.');
    }
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/users/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch user profile.');
    }
  },
  updateProfile: async (updatedProfileData: any) => {
    try {
      const token = getAuthToken();
      const response = await axios.put(`${apiUrl}/users/me/`, updatedProfileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update profile.');
    }
  },
  setupAgenda: async (agendaData: any) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${apiUrl}/users/me/agenda/`, agendaData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update agenda.');
    }
  },
};

// Course API
export const courseApi = {
  fetchCourses: async () => {
    try {
      const response = await axios.get(`${apiUrl}/courses/`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch courses.');
    }
  },
  fetchCourseDetails: async (courseId: any) => {
    try {
      const response = await axios.get(`${apiUrl}/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to fetch details for course ${courseId}.`);
    }
  },
  // Other course API functions can be added here
};

// Module API
export const moduleApi = {
  fetchModules: async (courseId: any) => {
    try {
      const response = await axios.get(`${apiUrl}/courses/${courseId}/modules/`);
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to fetch modules for course ${courseId}.`);
    }
  },
  // Other module API functions can be added here
};

// Quiz API
export const quizApi = {
  fetchQuiz: async (quizId: any) => {
    try {
      const response = await axios.get(`${apiUrl}/quizzes/${quizId}/`);
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to fetch quiz ${quizId}.`);
    }
  },
  fetchQuizQuestions: async (quizId: any) => {
    try {
      const response = await axios.get(`${apiUrl}/quizzes/${quizId}/questions/`);
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to fetch questions for quiz ${quizId}.`);
    }
  },
  submitQuiz: async (quizId: any, selectedAnswers: any) => {
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
      handleApiError(error, `Failed to submit quiz ${quizId}.`);
    }
  },
  submitAnswer: async (questionId: any, answer: any) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${apiUrl}/questions/${questionId}/submit/`,
        { answer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to submit answer for question ${questionId}.`);
    }
  }
};

// Enrollment API
export const enrollmentApi = {
  fetchEnrollments: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/enrollments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch enrollments.');
    }
  },
  enrollInCourse: async (courseId: any) => {
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
      handleApiError(error, `Failed to enroll in course ${courseId}.`);
    }
  },
  unenrollFromCourse: async (courseId: any) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${apiUrl}/enrollments/${courseId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      handleApiError(error, `Failed to unenroll from course ${courseId}.`);
    }
  },
  sendFeedback: async (enrollmentId: any, feedback: any) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${apiUrl}/enrollments/${enrollmentId}/feedback/`,
        { feedback },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to send feedback for enrollment ${enrollmentId}.`);
    }
  },
  updateProgress: async (enrollmentId: any, progress: any) => {
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
      handleApiError(error, `Failed to update progress for enrollment ${enrollmentId}.`);
    }
  },
  rateCourse: async (enrollmentId: any, rating: any) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${apiUrl}/enrollments/${enrollmentId}/rate/`,
        { rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to rate course for enrollment ${enrollmentId}.`);
    }
  },
  inviteToEnroll: async (courseId: any, email: any) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${apiUrl}/enrollments/invite/`,
        { course: courseId, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to invite user to enroll in course ${courseId}.`);
    }
  }
};

// Forum API
export const forumApi = {
  fetchForumPosts: async (courseId: any) => {
    try {
      const response = await axios.get(`${apiUrl}/courses/${courseId}/forums/`);
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to fetch forum posts for course ${courseId}.`);
    }
  },
  createForumPost: async (courseId: any, threadData: any) => {
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
      handleApiError(error, `Failed to create a forum post in course ${courseId}.`);
    }
  },
  fetchForumThreads: async (forumId: any) => {
    try {
      const response = await axios.get(`${apiUrl}/forums/${forumId}/threads/`);
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to fetch threads for forum ${forumId}.`);
    }
  },
  createForumThread: async (forumId: any, threadData: any) => {
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
      handleApiError(error, `Failed to create a thread in forum ${forumId}.`);
    }
  },
  fetchForumPostsForThread: async (threadId: any) => {
    try {
      const response = await axios.get(`${apiUrl}/threads/${threadId}/posts/`);
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to fetch posts for thread ${threadId}.`);
    }
  },
  createForumPostForThread: async (threadId: any, postData: any) => {
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
      handleApiError(error, `Failed to create a post in thread ${threadId}.`);
    }
  },
  reportForumPost: async (postId: any, reason: any) => {
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
      handleApiError(error, `Failed to report post ${postId}.`);
    }
  },
  createDiffusionChannel: async (courseId: any, channelData: any) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${apiUrl}/courses/${courseId}/diffusion/`,
        channelData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, `Failed to create a diffusion channel in course ${courseId}.`);
    }
  }
};

// Resource API
export const resourceApi = {
  fetchResources: async (moduleId: any, searchQuery: any) => {
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
      handleApiError(error, 'Failed to fetch resources.');
    }
  },
  uploadResource: async (formData: any, onUploadProgress: any) => {
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
      handleApiError(error, 'Failed to upload resource.');
    }
  },
  downloadResource: async (resourceId: any) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/resources/${resourceId}/download/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to download resource.');
    }
  }
};

// Notification API

export const notificationApi = {
  fetchNotifications: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch notifications.');
    }
  },
  markAsRead: async (notificationId: any) => {
    try {
      const token = getAuthToken();
      await axios.put(
        `${apiUrl}/notifications/${notificationId}/`,
        { read: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      handleApiError(error, `Failed to mark notification ${notificationId} as read.`);
    }
  },
  remindLater: async (notificationId: any) => {
    try {
      const token = getAuthToken();
      await axios.put(
        `${apiUrl}/notifications/${notificationId}/`,
        { remind: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      handleApiError(error, `Failed to remind later for notification ${notificationId}.`);
    }
  }
};

// Moderation API

export const moderationApi = {
  fetchReports: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/moderation/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch reports.');
    }
  },
  resolveReport: async (reportId: any) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${apiUrl}/moderation/${reportId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      handleApiError(error, `Failed to resolve report ${reportId}.`);
    }
  },
  banUser: async (userId: any) => {
    try {
      const token = getAuthToken();
      await axios.post(
        `${apiUrl}/moderation/ban/`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      handleApiError(error, `Failed to ban user ${userId}.`);
    }
  },
};

// Grade 

export const gradeApi = {
  fetchGrades: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/grades/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch grades.');
    }
  },
  resetGrades: async () => {
    try {
      const token = getAuthToken();
      await axios.delete(`${apiUrl}/grades/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      handleApiError(error, 'Failed to reset grades.');
    }
  },
};

// Assignment API

export const assignmentApi = {
  fetchAssignments: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${apiUrl}/assignments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch assignments.');
    }
  },
  revokeAssignment: async (assignmentId: any) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${apiUrl}/assignments/${assignmentId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      handleApiError(error, `Failed to revoke assignment ${assignmentId}.`);
    }
  },
  markAsComplete: async (assignmentId: any) => {
    try {
      const token = getAuthToken();
      await axios.put(
        `${apiUrl}/assignments/${assignmentId}/`,
        { completed: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      handleApiError(error, `Failed to mark assignment ${assignmentId} as complete.`);
    }
  },
};



