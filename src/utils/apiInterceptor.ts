import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { auth } from '../firebaseConfig';

// Create instance
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Check if online
    if (!navigator.onLine) {
      return Promise.reject(new Error('No internet connection'));
    }
    
    // Add authentication token
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        config.headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (auth.currentUser) {
        try {
          // Force token refresh
          const token = await auth.currentUser.getIdToken(true);
          
          // Update original request with new token
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          } else {
            originalRequest.headers = { 'Authorization': `Bearer ${token}` };
          }
          
          // Retry the request
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          
          // Force logout on authentication failure
          await auth.signOut();
          window.location.href = '/auth/login?session=expired';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;