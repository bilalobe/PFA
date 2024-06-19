import logging
from rest_framework.views import exception_handler
from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    AuthenticationFailed,
    APIException,
)
from django.http import JsonResponse

# Initialize the logger
logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler that logs errors and provides consistent error responses.
    """
    # Call REST framework's default exception handler first, to get the standard error response
    response = exception_handler(exc, context)

    # Define a method to create custom response data
    def create_custom_response_data(error_message, status_code, details):
        return {
            "error": error_message,
            "status_code": status_code,
            "details": details,
        }

    # If a response is returned by the default handler, customize it
    if response is not None:
        logger.error(f"Error: {str(exc)}", exc_info=True)
        response.data = create_custom_response_data(
            error_message=str(exc),
            status_code=response.status_code,
            details=response.data
        )
    else:
        # Handle different types of exceptions explicitly
        if isinstance(exc, NotFound):
            error_message = "Not Found"
            status_code = 404
        elif isinstance(exc, PermissionDenied):
            error_message = "Permission Denied"
            status_code = 403
        elif isinstance(exc, AuthenticationFailed):
            error_message = "Authentication Failed"
            status_code = 401
        elif isinstance(exc, APIException):
            error_message = "API Exception"
            status_code = 500
        elif isinstance(exc, ValueError):
            error_message = "Value Error"
            status_code = 400
        elif isinstance(exc, NotImplementedError):
            error_message = "Not Implemented"
            status_code = 501
        else:
            # For any other unhandled exceptions, return a generic server error response
            error_message = "Internal Server Error"
            status_code = 500

        # Log the error
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        # Create and return the custom JSON response
        custom_response_data = create_custom_response_data(
            error_message=error_message,
            status_code=status_code,
            details=str(exc)
        )
        return JsonResponse(custom_response_data, status=status_code)

    return response