import logging
import re
from django.core.exceptions import ValidationError

# Precompile the email regex pattern for efficiency
EMAIL_REGEX = re.compile(r"[^@]+@[^@]+\.[^@]+")

def validate_criteria(value):
    """
    Validates the criteria JSON structure.
    """
    if not value:
        raise ValidationError("Criteria cannot be empty.")

    min_points = value.get("min_points")
    max_points = value.get("max_points")
    additional_criteria = value.get("additional_criteria")

    if min_points is not None:
        if not isinstance(min_points, int) or min_points < 0:
            raise ValidationError("The 'min_points' must be a non-negative integer.")

    if max_points is not None:
        if not isinstance(max_points, int) or max_points < min_points:
            raise ValidationError("The 'max_points' must be an integer greater than or equal to 'min_points'.")

    if additional_criteria is not None:
        if not isinstance(additional_criteria, dict):
            raise ValidationError("The 'additional_criteria' must be a JSON object.")
        for key, val in additional_criteria.items():
            if not isinstance(val, bool):
                raise ValidationError(f"The value for '{key}' in 'additional_criteria' must be a boolean.")

def validate_username(username):
    """
    Validates the username.
    """
    if not 3 <= len(username) <= 20:
        error_msg = "Username must be between 3 and 20 characters"
        logging.error(error_msg)
        raise ValueError(error_msg)
    return username

def validate_email(email):
    """
    Validates the email address.
    """
    if not EMAIL_REGEX.match(email):
        error_msg = "Invalid email format"
        logging.error(error_msg)
        raise ValueError(error_msg)
    return email

def validate_order(model_class, value, course_id, module_id=None):
    """
    Validates that the order is unique within the context of a given course for any model.
    """
    if model_class.objects.filter(course_id=course_id, order=value).exclude(id=module_id).exists():
        raise ValidationError("Order must be unique within a course.")
    return value