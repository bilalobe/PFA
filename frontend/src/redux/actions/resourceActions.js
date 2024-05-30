// frontend/src/actions/resourceActions.js
import axios from 'axios';

export const uploadResourceRequest = () => ({
  type: 'UPLOAD_RESOURCE_REQUEST',
});

export const uploadResourceSuccess = (resource) => ({
  type: 'UPLOAD_RESOURCE_SUCCESS',
  payload: resource,
});

export const uploadResourceFailure = (error) => ({
  type: 'UPLOAD_RESOURCE_FAILURE',
  payload: error,
});

export const uploadResource = (formData) => {
  return async (dispatch) => {
    dispatch(uploadResourceRequest());
    try {
      const response = await axios.post(`/api/modules/${moduleId}/resources/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // ... authorization headers (if needed)
        }
      });
      dispatch(uploadResourceSuccess(response.data)); 
    } catch (error) {
      dispatch(uploadResourceFailure(error.message));
    }
  };
};