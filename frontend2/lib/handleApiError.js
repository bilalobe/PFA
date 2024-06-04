const handleApiError = (error, defaultMessage) => {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error((error.response.data && error.response.data.detail) || defaultMessage);
        case 401:
          throw new Error('Your session has expired. Please log in again.');
        case 403:
          throw new Error('You do not have permission to perform this action.');
        case 404:
          throw new Error('The requested resource could not be found.');
        case 500:
          throw new Error('An internal server error occurred. Please try again later.');
        default:
          throw new Error(defaultMessage);
      }
    }
    throw error;
  };
  
  export default handleApiError;