import logging 
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import APIException, NotFound, PermissionDenied, AuthenticationFailed

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler for the API.
    Logs exceptions and returns a consistent error response format.
    """

    response = exception_handler(exc, context)

    # Log the exception
    view_name = context.get('view', 'unknown view')
    logger.error(
        f"Exception occurred in {view_name}: {exc}",
        exc_info=True,
        extra={'request': context['request']}
    )

    # Customize error responses for specific exceptions
    if isinstance(exc, NotFound):
        response = Response({'error': 'Not Found', 'detail': str(exc)}, status=status.HTTP_404_NOT_FOUND)
    elif isinstance(exc, PermissionDenied):
        response = Response({'error': 'Permission Denied', 'detail': str(exc)}, status=status.HTTP_403_FORBIDDEN)
    elif isinstance(exc, AuthenticationFailed):
        response = Response({'error': 'Authentication Failed', 'detail': str(exc)}, status=status.HTTP_401_UNAUTHORIZED)
    elif isinstance(exc, APIException):
        response = Response({'error': exc.default_detail, 'detail': str(exc)}, status=exc.status_code)

    # If the exception is unhandled, log it and return a generic 500 error
    if response is None:
        response = Response({'error': 'Internal Server Error', 'detail': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
