import json
import logging
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from rest_framework.views import exception_handler
from rest_framework import status

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """Handle uncaught exceptions and return JSON responses"""
        
        # Log the exception
        logger.error(f"Unhandled exception: {str(exception)}", exc_info=True)
        
        # Handle specific exception types
        if isinstance(exception, ValidationError):
            return JsonResponse({
                'error': 'Validation Error',
                'details': exception.message_dict if hasattr(exception, 'message_dict') else str(exception)
            }, status=400)
        
        # Handle database errors
        if 'database' in str(exception).lower():
            return JsonResponse({
                'error': 'Database Error',
                'message': 'A database error occurred. Please try again.'
            }, status=500)
        
        # Generic server error
        return JsonResponse({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred. Please try again later.'
        }, status=500)


def custom_exception_handler(exc, context):
    """Custom DRF exception handler for consistent JSON responses"""
    
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize the response format
        custom_response_data = {
            'error': response.data.get('detail', 'An error occurred'),
            'status_code': response.status_code
        }
        
        # Handle field-specific errors
        if isinstance(response.data, dict):
            field_errors = {}
            for field, errors in response.data.items():
                if field != 'detail':
                    field_errors[field] = errors if isinstance(errors, list) else [str(errors)]
            
            if field_errors:
                custom_response_data['field_errors'] = field_errors
        
        response.data = custom_response_data
    
    return response