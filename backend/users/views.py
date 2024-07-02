from django.contrib.auth.models import AnonymousUser
from rest_framework import viewsets, permissions, status

from backend.users.models import User
from .serializers import (
    UserSerializer,
    UserDetailSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
)
from .permissions import IsOwnProfileOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from backend.common.firebase_admin_init import firebase_auth
from backend.enrollments.models import Enrollment
from backend.enrollments.serializers import EnrollmentSerializer
import firebase_admin
from firebase_admin import credentials, firestore, storage

# ... other imports 

# Initialize Firebase Admin SDK (Handle potential errors)
cred = credentials.Certificate('path/to/your/serviceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'your-project-id.appspot.com'
})
db = firestore.client()
bucket = storage.bucket()

class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for handling user-related operations.
    This viewset provides the following actions:
    - list: Get a list of users
    - retrieve: Get details of a specific user
    - create: Create a new user
    - update: Update an existing user
    - partial_update: Partially update an existing user
    - destroy: Delete an existing user
    - list_enrollments: Get a list of enrollments for a user
    - list_courses: Get a list of courses for a user

    The permissions for each action are determined based on the user's role and the action being performed.
    """
    queryset = User.objects.all()  # This is not used since you're fetching from Firestore
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        """
        Return the serializer class based on the action being performed.
        """
        if self.action == "list":
            return UserSerializer
        elif self.action == "retrieve":
            return UserDetailSerializer
        elif self.action == "create":
            return UserCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        """
        Returns a queryset based on the action being performed.
        Not used as the data is fetched from Firestore.
        """
        if self.action == "list":
            return User.objects.all().values("id", "username", "email", "user_type")
        return super().get_queryset()

    def get_object(self):
        """
        Return the user object based on the action being performed.
        """
        if self.action == "retrieve" and self.kwargs["pk"] == "me":
            return self.request.user
        return super().get_object()

    def get_permissions(self):
        """
        Return the permissions based on the action being performed.
        """
        if self.action == "create":
            permission_classes = [permissions.AllowAny]
        elif self.action in ["update", "partial_update", "destroy"]:
            permission_classes = [permissions.IsAuthenticated, IsOwnProfileOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        """
        Handles user creation using Firebase Authentication.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user_data = serializer.validated_data
                user = firebase_auth.create_user(
                    email=user_data['email'],
                    email_verified=False,
                    password=user_data['password'],
                    display_name=user_data.get('display_name', ''),
                    disabled=False
                )
                # Optionally, save additional user data to your Firestore database here
                return Response({"uid": user.uid, "email": user.email}, status=status.HTTP_201_CREATED)
            except Exception as e:
                # Handle specific exceptions from Firebase and return appropriate responses
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"], url_path="enrollments", url_name="enrollments")
    def list_enrollments(self, request, pk=None):
        """
        Get a list of enrollments for a user.
        Fetches enrollments from Firestore.
        """
        user_ref = db.collection('users').document(pk)
        user_doc = user_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            if user_data:
                enrollments = user_data.get('enrollments', [])
                return Response(enrollments)
            else:
                raise NotFound("User data not found.")
        else:
            raise NotFound("User not found.")

    @action(detail=True, methods=["get"], url_path="courses", url_name="courses")
    def list_courses(self, request, pk=None):
        """
        Get a list of courses for a user.
        Fetches courses from Firestore.
        """
        if pk and pk != "me":
            user_ref = db.collection('users').document(pk)
            user_doc = user_ref.get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                if user_data:
                    courses = user_data.get('courses', [])
                    return Response(courses)
                else:
                    raise NotFound("User data not found.")
            else:
                raise NotFound("User not found.")
        else:
            user = request.user
            if isinstance(user, AnonymousUser):
                raise PermissionDenied("You must be logged in to view courses.")
            return Response({"detail": "This method is not implemented yet."}, status=status.HTTP_501_NOT_IMPLEMENTED)