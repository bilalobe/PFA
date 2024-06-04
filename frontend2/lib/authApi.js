import axios from 'axios';
import handleApiError from './handleApiError';

const apiUrl = 'http://localhost:8000/api/';

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

export default authApi;
