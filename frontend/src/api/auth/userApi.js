import axios from 'axios';

const apiUrl = '/api/users/'; // Base URL for user-related endpoints

const getProfile = async () => {
  try {
    const response = await axios.get(`${apiUrl}me/`); // Assuming an endpoint to get the current user's profile
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateProfile = async (updatedProfileData) => {
  try {
    const response = await axios.put(`${apiUrl}me/`, updatedProfileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default { getProfile, updateProfile };
