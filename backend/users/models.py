from datetime import datetime
from enum import Enum
import logging

from backend.users.tasks import resize_profile_picture
from backend.common.firebase_admin_init import db
from backend.common.validators import validate_email, validate_username
import logging
from enum import Enum


# Configure logging
logging.basicConfig(level=logging.INFO)


class UserType(Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    SUPERVISOR = "supervisor"

class UserStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class UserRole(Enum):
    STUDENT = "student"
    STAFF = "staff"
    SUPERUSER = "superuser"

class Permissions(Enum):
    VIEW_COURSE = "view_course"
    EDIT_COURSE = "edit_course"
    CREATE_COURSE = "create_course"
    DELETE_COURSE = "delete_course"

class User:
    """
    Represents a user in the system.

    Attributes:
        username (str): The username of the user.
        email (str): The email address of the user.
        user_type (UserType): The type of the user (e.g., STUDENT, TEACHER, SUPERVISOR).
        bio (str): The bio of the user.
        profile_picture (str): The path to the user's profile picture.
        role (UserRole): The role of the user (e.g., STUDENT, STAFF, SUPERUSER).
        facebook_link (str): The Facebook profile link of the user.
        twitter_link (str): The Twitter profile link of the user.
        linkedin_link (str): The LinkedIn profile link of the user.
        instagram_link (str): The Instagram profile link of the user.
        status (UserStatus): The status of the user (e.g., ACTIVE, INACTIVE).
        last_login (datetime): The timestamp of the user's last login.
        courses (list): The list of courses the user is enrolled in.
        enrollments (list): The list of enrollments the user has.
        user_id (str): The unique identifier of the user.
    """

    def __init__(self, username, email, user_type=UserType.STUDENT, bio="", profile_picture=None,
                 role=UserRole.STUDENT, facebook_link=None, twitter_link=None, linkedin_link=None, instagram_link=None,
                 status=UserStatus.ACTIVE, last_login=None, courses=None, enrollments=None, user_id=None):
        try:
            self.username = validate_username(username)
            self.email = validate_email(email)
            self.user_type = user_type
            self.bio = bio
            self.profile_picture = profile_picture
            self.set_role(role)
            self.facebook_link = facebook_link
            self.twitter_link = twitter_link
            self.linkedin_link = linkedin_link
            self.instagram_link = instagram_link
            self.status = status
            self.last_login = last_login or datetime.utcnow()
            self.courses = courses or []
            self.enrollments = enrollments or []
            self.user_id = user_id
        except ValueError as e:
            logging.error(f"Error initializing user: {e}")
            raise

    def set_role(self, role):
        """
        Sets the role of the user.

        Args:
            role (UserRole): The role to set for the user.

        Raises:
            ValueError: If an invalid role is provided.
        """
        try:
            if role == UserRole.STAFF:
                self.is_staff = True
            elif role == UserRole.SUPERUSER:
                self.is_superuser = True
            elif role == UserRole.STUDENT:
                self.is_staff = False
                self.is_superuser = False
            else:
                raise ValueError("Invalid role")
        except ValueError as e:
            logging.error(f"Error setting role: {e}")
            raise

    @classmethod
    def from_dict(cls, doc):
        """
        Creates a User object from a dictionary.

        Args:
            doc (dict): The dictionary containing the user data.

        Returns:
            User: The User object created from the dictionary.
        """
        return cls(**doc)

    def to_dict(self):
        """
        Returns a dictionary representation of the User object, excluding sensitive information.

        Returns:
            dict: The dictionary representation of the User object.
        """
        user_dict = self.__dict__.copy()
        # Exclude sensitive information
        user_dict.pop('password_hash', None)
        return user_dict
    
    def save(self):
        """
        Saves the User object to Firestore, including resizing the profile picture if present.
        """
        try:
            # Check if the User object has an image field that needs resizing
            if hasattr(self, 'profile_picture') and self.profile_picture:
                new_image_path = resize_profile_picture(self.user_id, 'profile_picture')
                # Update the User object with the new image path
                self.profile_picture = new_image_path
    
            user_data = self.to_dict()
            db.collection("users").document(self.email).set(user_data)
        except Exception as e:
            logging.error(f"Error saving user to Firestore: {e}")
            raise


    def profile_completeness(self):
        """
        Calculates the profile completeness percentage based on filled fields.

        Returns:
            str: The profile completeness percentage.
        """
        fields = ["username", "email", "bio", "profile_picture"]
        filled_fields = sum(bool(getattr(self, field)) for field in fields)
        total_fields = len(fields)
        completeness = (filled_fields / total_fields) * 100
        return f"{completeness}%"

    @property
    def permissions(self):
        """
        Returns a list of permissions based on the user's type.

        Returns:
            list: The list of permissions.
        """
        permissions_map = {
            UserType.STUDENT: [Permissions.VIEW_COURSE],
            UserType.TEACHER: [Permissions.VIEW_COURSE, Permissions.EDIT_COURSE, Permissions.CREATE_COURSE],
            UserType.SUPERVISOR: [Permissions.VIEW_COURSE, Permissions.EDIT_COURSE, Permissions.CREATE_COURSE, Permissions.DELETE_COURSE],
        }
        return permissions_map.get(self.user_type, [])