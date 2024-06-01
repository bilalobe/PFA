import axios from 'axios';
import {
  UPLOAD_RESOURCE_REQUEST,
  UPLOAD_RESOURCE_SUCCESS,
  UPLOAD_RESOURCE_FAILURE,
  FETCH_RESOURCES_REQUEST,
  FETCH_RESOURCES_SUCCESS,
  FETCH_RESOURCES_FAILURE,
} from './types';

// Fetch resources actions
export const fetchResourcesRequest = () => ({ type: FETCH_RESOURCES_REQUEST });
export const fetchResourcesSuccess = (resources) => ({ type: FETCH_RESOURCES_SUCCESS, payload: resources });
export const fetchResourcesFailure = (error) => ({ type: FETCH_RESOURCES_FAILURE, payload: error });

export const fetchResources = (moduleId, searchQuery) => {
  return async (dispatch) => {
    dispatch(fetchResourcesRequest());
    try {
      let url = '/api/resources/';
      if (moduleId) {
        url += `?module=${moduleId}`;
      }
      if (searchQuery) {
        url += moduleId ? `&search=${searchQuery}` : `?search=${searchQuery}`;
      }
      const response = await axios.get(url);
      dispatch(fetchResourcesSuccess(response.data));
    } catch (error) {
      dispatch(fetchResourcesFailure(error.message));
    }
  };
};

// Upload resource actions
export const uploadResourceRequest = () => ({ type: UPLOAD_RESOURCE_REQUEST });
export const uploadResourceSuccess = (resource) => ({ type: UPLOAD_RESOURCE_SUCCESS, payload: resource });
export const uploadResourceFailure = (error) => ({ type: UPLOAD_RESOURCE_FAILURE, payload: error });

export const uploadResource = (formData, onUploadProgress) => {
  return async (dispatch) => {
    dispatch(uploadResourceRequest());
    try {
      const response = await axios.post('/api/resources/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });
      dispatch(uploadResourceSuccess(response.data));
    } catch (error) {
      dispatch(uploadResourceFailure(error.message));
    }
  };
};
