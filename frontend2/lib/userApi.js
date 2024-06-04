import axios from 'axios';

const apiUrl = 'http://localhost:8000/api/';

const getAuthToken = () => localStorage.getItem('token');

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

export default userApi;
