import axios from 'axios';

const API_URL = '/api/auth/';

const register = async (username, email, password, userType) => {
  try {
    const response = await axios.post(`${API_URL}register/`, {
      username,
      email,
      password,
      profile: { user_type: userType },
    });
    return response.data;
  } catch (error) {
    throw error; 
  }
};

const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}token/`, { // Token obtain endpoint
      username,
      password,
    });
    return response.data; 
  } catch (error) {
    throw error;
  }
};

const refreshToken = async (refreshToken) => {
  try {
    const response = await axios.post(`${API_URL}token/refresh/`, { 
      refresh: refreshToken,
    });
    return response.data; 
  } catch (error) {
    throw error;
  }
};

const logout = async () => {
  try {
    // ... (You might have a specific logout endpoint on your backend)
    // await axios.post(`${API_URL}logout/`); 
  } catch (error) {
    throw error;
  }
};

export default { register, login, refreshToken, logout };