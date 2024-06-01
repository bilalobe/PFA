import axios from 'axios';

export const loginUserRequest = () => ({ type: 'LOGIN_REQUEST' });
export const loginUserSuccess = (user, token) => ({ type: 'LOGIN_SUCCESS', payload: { user, token } });
export const loginUserFailure = (error) => ({ type: 'LOGIN_FAILURE', payload: error });

export const loginUser = (username, password) => {
  return async (dispatch) => {
    dispatch(loginUserRequest());
    try {
      const response = await axios.post('/api/auth/login/', { username, password });
      dispatch(loginUserSuccess(response.data.user, response.data.access)); // Store user and token
    } catch (error) {
      dispatch(loginUserFailure(error.message));
    }
  };
};

// Logout Action
export const logoutUserRequest = () => ({ type: 'LOGOUT_REQUEST' });
export const logoutUserSuccess = () => ({ type: 'LOGOUT_SUCCESS' });
export const logoutUserFailure = (error) => ({ type: 'LOGOUT_FAILURE', payload: error });





export const logoutUser = () => {
  return async (dispatch) => {
    dispatch(logoutUserRequest());
    try {
      // ... (Optional: Send a request to your API to invalidate the token)
      dispatch(logoutUserSuccess());
    } catch (error) {
      dispatch(logoutUserFailure(error.message));
    }
  };
};