import axios, { AxiosError } from 'axios';

const handleApiError = (error: AxiosError) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(error.response.data);
    if (typeof error.response.data === 'string') {
      throw new Error(error.response.data);
    } else {
      throw new Error('An error occurred');
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error(error.request);
    throw new Error('No response received from the server');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error', error.message);
    throw new Error('An error occurred while setting up the request');
  }
};

export const api = {
  get: async (url: string, params?: any) => {
    try {
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  post: async (url: string, data?: any) => {
    try {
      const response = await axios.post(url, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  put: async (url: string, data?: any) => {
    try {
      const response = await axios.put(url, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  delete: async (url: string) => {
    try {
      const response = await axios.delete(url);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};