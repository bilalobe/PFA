import { FirebaseError } from 'firebase/app';

export interface ApiError extends Error {
  response?: {
    status: number;
    data: {
      detail?: string;
    };
  };
  request?: any;
}

export const handleApiError = (error: unknown, defaultMessage: string): never => {
  console.error(error);

  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;

    if (apiError.response) {
      const { status, data } = apiError.response;
      const message = data.detail || defaultMessage;

      switch (status) {
        case 400:
          throw new Error(message || 'Bad Request: Please check your input.');
        case 401:
          throw new Error('Unauthorized: Please log in again.');
        case 403:
          throw new Error('Forbidden: You do not have permission.');
        case 404:
          throw new Error(message || 'Not Found: The requested resource was not found.');
        case 500:
          throw new Error(message || 'Internal Server Error: Please try again later.');
        default:
          throw new Error(message || 'An unexpected error occurred.');
      }
    } else if (apiError.request) {
      throw new Error('No response received from server.');
    }
  }
  
  throw new Error(defaultMessage || 'An unknown error occurred.');
};

export const handleFirebaseError = (error: FirebaseError, defaultMessage: string): never => {
  console.error('Firebase error:', error.code, error.message);
  
  switch (error.code) {
    case 'auth/user-not-found':
      throw new Error('User not found. Please check your credentials.');
    case 'auth/wrong-password':
      throw new Error('Invalid password. Please try again.');
    case 'auth/email-already-in-use':
      throw new Error('Email already in use. Try signing in instead.');
    // Add other Firebase error codes as needed
    default:
      throw new Error(defaultMessage || error.message || 'An unknown error occurred.');
  }
};