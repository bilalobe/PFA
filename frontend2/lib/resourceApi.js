import axios from 'axios';

const apiUrl = 'http://localhost:8000/api/';

const getAuthToken = () => localStorage.getItem('token');

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

export default resourceApi;
