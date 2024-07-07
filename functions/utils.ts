const functions = require('firebase-functions'); // Make sure you have this import 

// Function to create standardized error messages.
function createErrorMessage(
    errorType: string,
    errorMessage: string
) {
    const formattedErrorMessage = `${errorType}: ${errorMessage}`;
    return {
        success: false,
        error: formattedErrorMessage,
        date: new Date(),
        errorType,
    };
}

const ERROR_TYPES = {
    database: 'DATABASE_ERROR',
    validation: 'VALIDATION_ERROR',
    auth: 'AUTH_ERROR',
    not_found: 'NOT_FOUND',
    default: 'ERROR',
};
export const handleCloudFunctionError = (error, res, defaultStatus=500) => {
  // Example usage: 
  console.error('Error in myCloudFunction', error);

  let errorMessage;
  let status = defaultStatus; // Set the default HTTP status code

  // Handle Firebase Errors with appropriate status codes
  if (error instanceof functions.https.HttpsError) {
    switch (error.code) {
      case 'permission-denied': 
          status = 403;
          errorMessage = createErrorMessage(ERROR_TYPES.auth, 'Unauthorized'); 
          break;
      case 'not-found': 
          status = 404; 
          errorMessage = createErrorMessage(ERROR_TYPES.not_found, 'Not found');
          break;
      // ... other Firebase error types (https://firebase.google.com/docs/functions/handle-errors#detect_errors)
      default: 
          errorMessage = createErrorMessage(ERROR_TYPES.default, 'An error occurred.');
    }
  } else if (error instanceof Error) { 
      errorMessage = createErrorMessage(ERROR_TYPES.default, error.message);
  } 

  return res.status(status).json(errorMessage); // Standardized JSON error response 
};