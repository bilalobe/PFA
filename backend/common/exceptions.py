import logging
from google.cloud import exceptions
from rest_framework.views import exception_handler
from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    AuthenticationFailed,
    APIException,
)

# Initialize the logger
logger = logging.getLogger(__name__)

# Mapping Firebase exceptions to HTTP status codes and messages
FIREBASE_EXCEPTIONS_MAPPING = {
    exceptions.GoogleCloudError: (500, "Google Cloud API Error"),
    exceptions.Redirection: (307, "Redirection"),
    exceptions.MovedPermanently: (301, "Moved Permanently"),
    exceptions.NotModified: (304, "Not Modified"),
    exceptions.TemporaryRedirect: (307, "Temporary Redirect"),
    exceptions.ResumeIncomplete: (308, "Resume Incomplete"),
    exceptions.ClientError: (400, "Client Error"),
    exceptions.BadRequest: (400, "Bad Request"),
    exceptions.Unauthorized: (401, "Unauthorized"),
    exceptions.Forbidden: (403, "Forbidden"),
    exceptions.NotFound: (404, "Not Found"),
    exceptions.MethodNotAllowed: (405, "Method Not Allowed"),
    exceptions.Conflict: (409, "Conflict"),
    exceptions.LengthRequired: (411, "Length Required"),
    exceptions.PreconditionFailed: (412, "Precondition Failed"),
    exceptions.RequestRangeNotSatisfiable: (416, "Request Range Not Satisfiable"),
    exceptions.TooManyRequests: (429, "Too Many Requests"),
    exceptions.ServerError: (500, "Server Error"),
    exceptions.InternalServerError: (500, "Internal Server Error"),
    exceptions.MethodNotImplemented: (501, "Method Not Implemented"),
    exceptions.BadGateway: (502, "Bad Gateway"),
    exceptions.ServiceUnavailable: (503, "Service Unavailable"),
    exceptions.GatewayTimeout: (504, "Gateway Timeout"),
}

def handle_firebase_exception(exc):
    """
    Handles Firebase exceptions by mapping them to HTTP status codes and messages.
    """
    for exception_type, (status_code, message) in FIREBASE_EXCEPTIONS_MAPPING.items():
        if isinstance(exc, exception_type):
            return {
                "error": message,
                "status_code": status_code,
                "details": str(exc),
            }
    # Default response for unhandled Firebase exceptions
    return {
        "error": "Unknown Firebase Error",
        "status_code": 500,
        "details": str(exc),
    }
class CustomAPIException(APIException):
    def __init__(self, detail, status_code, response_data=None):
        super().__init__(detail, code=status_code)
        self.status_code = status_code
        self.response_data = response_data

    def get_full_details(self):
        """
        Returns the response data to be used in the exception handler.
        """
        return {
            "error": self.detail,
            "status_code": self.status_code,
            "details": self.response_data or {},
        }

def custom_exception_handler(exc, context):
    """
    Custom exception handler that logs errors and provides consistent error responses.
    """
    # Call REST framework's default exception handler first, to get the standard error response
    response = exception_handler(exc, context)

        # Handle Firebase exceptions
    firebase_response = handle_firebase_exception(exc)
    if firebase_response:
        logger.error(f"Firebase exception: {str(exc)}", exc_info=True)
        raise CustomAPIException(
            detail=firebase_response, 
            status_code=firebase_response["status_code"]
        )
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
        response_data = create_custom_response_data(
            error_message=str(exc),
            status_code=response.status_code,
            details=response.data,
        )
        raise CustomAPIException(detail=response_data, status_code=response.status_code)

    # Handle unhandled exceptions
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
    # Handling for TranslationError
    elif isinstance(exc, TranslationError):
        error_message = "Translation Error"
        status_code = 422  # HTTP 422 Unprocessable Entity
    else:
        error_message = "Internal Server Error"
        status_code = 500

    # Log the error
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    response_data = create_custom_response_data(
        error_message=error_message, status_code=status_code, details=str(exc)
    )
    raise CustomAPIException(detail=response_data, status_code=status_code)

# Custom exceptions for apps
class CustomException(Exception):
    def __init__(self, detail, context):
        self.detail = detail
        self.context = context

    def __str__(self):
        return f"{self.context}: {self.detail}"

    def __repr__(self):
        return f"CustomException({self.context}: {self.detail})"
    
class TranslationError(Exception):
    def __init__(self, detail):
        self.detail = detail

class PostNotFoundException(Exception):
    pass