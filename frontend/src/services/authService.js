import authApi from '../api/auth/authApi';

const localStorageKey = 'user';

const register = async (username, email, password, userType) => {
  try {
    const userData = await authApi.register(username, email, password, userType);
    localStorage.setItem(localStorageKey, JSON.stringify(userData));
  } catch (error) {
    throw error;
  }
};

const login = async (username, password) => {
  try {
    const tokenData = await authApi.login(username, password);
    localStorage.setItem('accessToken', tokenData.access);
    localStorage.setItem('refreshToken', tokenData.refresh);

    const userData = await authApi.getProfile(); 
    localStorage.setItem(localStorageKey, JSON.stringify(userData));

    return userData;
  } catch (error) {
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem(localStorageKey);
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const getCurrentUser = () => {
  const storedUser = localStorage.getItem(localStorageKey);
  return storedUser ? JSON.parse(storedUser) : null;
};

const handleTokenRefresh = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      const newTokenData = await authApi.refreshToken(refreshToken);
      localStorage.setItem('accessToken', newTokenData.access);
      if (newTokenData.refresh) {
        localStorage.setItem('refreshToken', newTokenData.refresh);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  handleTokenRefresh,
};
