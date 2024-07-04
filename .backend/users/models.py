"""   from datetime import datetime
from enum import Enum
import logging

from backend.users.tasks import resize_profile_picture
from backend.common.firebase_admin_init import db, auth
from backend.common.validators import validate_email, validate_username
from backend.users.exceptions import UserInitializationError, UserRoleError, UserSaveError
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
            self.user_id = user_id or self.create_firebase_user(email)
        except ValueError as e:
            logging.error(f"Error initializing user: {e}")
            raise UserInitializationError(e)

    def create_firebase_user(self, email):
         
        Creates a new user in Firebase Authentication.

        Args:
            email (str): The email address of the user.

        Returns:
            str: The UID of the created Firebase user.
         
        user_record = auth.create_user(email=email)
        return user_record.uid

    def set_role(self, role):
         
        Sets the role of the user.

        Args:
            role (UserRole): The role to be set for the user.

        Raises:
            UserRoleError: If an invalid role is provided.

         
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
            raise UserRoleError(e)
        
    @classmethod
    def from_dict(cls, doc):
         
        Creates a User object from a dictionary.

        Args:
            doc (dict): The dictionary containing the user data.

        Returns:
            User: The User object created from the dictionary.
         
        return cls(**doc)

    def to_dict(self):
         
        Returns a dictionary representation of the User object, excluding sensitive information.

        Returns:
            dict: The dictionary representation of the User object.
         
        user_dict = self.__dict__.copy()
        # Exclude sensitive information
        user_dict.pop('password_hash', None)
        return user_dict
    
    def save(self):
         
        Saves the user data to Firestore.

        This method saves the user data to Firestore by converting the user object to a dictionary,
        removing the 'user_id' field, and then storing the dictionary in the 'users' collection
        with the user's email as the document ID.

        If the user has a profile picture, it resizes the picture and updates the 'profile_picture'
        field before saving.

        Raises:
            UserSaveError: If there is an error saving the user to Firestore.

         
        try:
            if hasattr(self, 'profile_picture') and self.profile_picture:
                new_image_path = resize_profile_picture(self.user_id, 'profile_picture')
                self.profile_picture = new_image_path

            user_data = self.to_dict()
            # Remove the user_id from the dictionary to prevent storing it in Firestore
            user_data.pop('user_id', None)
            db.collection("users").document(self.email).set(user_data)
        except Exception as e:
            logging.error(f"Error saving user to Firestore: {e}")
            raise UserSaveError(e)


    def profile_completeness(self):
         
        Calculates the profile completeness percentage based on filled fields.

        Returns:
            str: The profile completeness percentage.
         
        fields = ["username", "email", "bio", "profile_picture"]
        filled_fields = sum(bool(getattr(self, field)) for field in fields)
        total_fields = len(fields)
        completeness = (filled_fields / total_fields) * 100
        return f"{completeness}%"

    @property
    def permissions(self):
         
        Returns a list of permissions based on the user's type.

        Returns:
            list: The list of permissions.
         
        permissions_map = {
            UserType.STUDENT: [Permissions.VIEW_COURSE],
            UserType.TEACHER: [Permissions.VIEW_COURSE, Permissions.EDIT_COURSE, Permissions.CREATE_COURSE],
            UserType.SUPERVISOR: [Permissions.VIEW_COURSE, Permissions.EDIT_COURSE, Permissions.CREATE_COURSE, Permissions.DELETE_COURSE],
        }
        return permissions_map.get(self.user_type, [])   """