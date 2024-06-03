import logging
from rest_framework.views import exception_handler
from rest_framework.exceptions import NotFound, PermissionDenied, AuthenticationFailed, APIException
from django.http import JsonResponse

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler that logs errors and provides consistent error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        logger.error(f"Error: {str(exc)}", exc_info=True)
        custom_response_data = {
            'error': str(exc),
            'status_code': response.status_code,
            'details': response.data,
        }
        response.data = custom_response_data
    else:
        if isinstance(exc, NotFound):
            custom_response_data = {
                'error': 'Not Found',
                'status_code': 404,
                'details': str(exc),
            }
            return JsonResponse(custom_response_data, status=404)
        elif isinstance(exc, PermissionDenied):
            custom_response_data = {
                'error': 'Permission Denied',
                'status_code': 403,
                'details': str(exc),
            }
            return JsonResponse(custom_response_data, status=403)
        elif isinstance(exc, AuthenticationFailed):
            custom_response_data = {
                'error': 'Authentication Failed',
                'status_code': 401,
                'details': str(exc),
            }
            return JsonResponse(custom_response_data, status=401)
        elif isinstance(exc, APIException):
            custom_response_data = {
                'error': 'API Exception',
                'status_code': 500,
                'details': str(exc),
            }
            return JsonResponse(custom_response_data, status=500)
        else:
            custom_response_data = {
                'error': 'Internal Server Error',
                'status_code': 500,
                'details': str(exc),
            }
            return JsonResponse(custom_response_data, status=500)

    return response
