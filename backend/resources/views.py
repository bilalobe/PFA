import datetime
import os
import logging
import firebase_admin
from firebase_admin import credentials, initialize_app, storage
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from rest_framework import viewsets, permissions, parsers, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from django.http import HttpResponseRedirect
from django.contrib.auth import get_user_model
from backend.resources.permissions import IsModerator
from .models import Resource
from .serializers import ResourceSerializer

# Setup logger
logger = logging.getLogger(__name__)

# Get the custom user model
User = get_user_model()

# Initialize Firebase Admin SDK
def initialize_firebase():
    try:
        return firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate({
            # Provide the path to your Firebase service account key JSON file or use environment variables
            "type": os.environ.get("FIREBASE_TYPE", ""),
            "project_id": os.environ.get("FIREBASE_PROJECT_ID", ""),
            "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID", ""),
            "private_key": os.environ.get("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
            "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL", ""),
            "client_id": os.environ.get("FIREBASE_CLIENT_ID", ""),
            "auth_uri": os.environ.get("FIREBASE_AUTH_URI", ""),
            "token_uri": os.environ.get("FIREBASE_TOKEN_URI", ""),
            "auth_provider_x509_cert_url": os.environ.get("FIREBASE_AUTH_PROVIDER_X509_CERT_URL", ""),
            "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_X509_CERT_URL", "")
        })
        return initialize_app(cred, {'storageBucket': os.environ.get("FIREBASE_STORAGE_BUCKET")})

firebase_app = initialize_firebase()
bucket = storage.bucket(app=firebase_app)


class ResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing resources.

    Only instructors can create, update, and delete resources.
    Enrolled students can only view resources associated with their courses.

    Attributes:
        queryset (QuerySet): The queryset of resources.
        serializer_class (Serializer): The serializer class for resources.
        parser_classes (tuple): The parser classes for handling multipart and form data.
        permission_classes (list): The permission classes for resource access.
        filter_backends (list): The filter backends for resource filtering.
        search_fields (list): The fields to search resources by.
        ordering_fields (list): The fields to order resources by.
    """

    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["title", "upload_date"]

    def get_queryset(self):
        """
        Returns a filtered queryset based on the 'module' query parameter.
        For enrolled students, only resources associated with their enrolled courses are returned.
        """
        queryset = super().get_queryset()
        module_id = self.request.GET.get("module")
        if module_id:
            queryset = queryset.filter(module_id=module_id)

        user = self.request.user
        if user.is_authenticated:
            userprofile = getattr(user, "userprofile", None)
            if userprofile and userprofile.user_type == "student":
                enrolled_courses = userprofile.enrollments.values_list("course", flat=True)
                queryset = queryset.filter(module__course__in=enrolled_courses)
        
        return queryset

    def perform_create(self, serializer):
        """
        Handles resource creation, including file upload, validation, and saving to Firebase Storage.
        Only instructors can create resources.
        """
        user = self.request.user
        userprofile = getattr(user, "userprofile", None)
        if not userprofile or userprofile.user_type != "teacher":
            raise PermissionDenied("Only instructors can upload resources.")

        try:
            file = serializer.validated_data["file"]
            self.validate_file(file)
            blob_url = self.upload_to_firebase_storage(file)
            serializer.save(
                module_id=self.kwargs.get("module_pk"), uploaded_by=user, file=blob_url
            )
        except ValidationError as e:
            logger.error(f"Validation Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Upload Error: {e}")
            return Response(
                {"error": "An error occurred during upload."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def validate_file(self, file):
        """
        Validates the uploaded file for allowed extensions and size limit.

        Args:
            file (File): The uploaded file.

        Raises:
            ValidationError: If the file has an invalid extension or exceeds the size limit.
        """
        allowed_extensions = [
            "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "zip", "rar"
        ]
        validator = FileExtensionValidator(allowed_extensions=allowed_extensions)
        validator(file)

        max_file_size = 5 * 1024 * 1024  # 5MB
        if file.size > max_file_size:
            raise ValidationError(f"File size must be less than {max_file_size / (1024 * 1024)}MB.")

    def upload_to_firebase_storage(self, file):
        """
        Uploads the file to Firebase Storage and returns the file URL.

        Args:
            file (File): The file to upload.

        Returns:
            str: The URL of the uploaded file.

        Raises:
            Exception: If an error occurs during the upload process.
        """
        try:
            blob = bucket.blob(file.name)
            blob.upload_from_file(file, content_type=file.content_type)
            blob.make_public()
            return blob.public_url
        except Exception as e:
            logger.error(f"Firebase Storage Error: {e}")
            raise

    def get_firebase_download_url(self, file_name):
        """
        Generates a signed URL for downloading a file directly from Firebase Storage.

        Args:
            file_name (str): The name of the file.

        Returns:
            str: The signed URL for downloading the file.

        Raises:
            Exception: If an error occurs while generating the download URL.
        """
        try:
            blob = bucket.blob(file_name)
            url = blob.generate_signed_url(expiration=datetime.timedelta(minutes=60), method='GET')
            return url
        except Exception as e:
            logger.error(f"Error generating Firebase download URL: {e}")
            raise

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieves a resource and provides a direct download link from Firebase Storage.

        Returns:
            HttpResponseRedirect: The response with the download URL.

        Raises:
            Exception: If an error occurs while retrieving the file.
        """
        instance = self.get_object()
        if instance.file:
            try:
                download_url = self.get_firebase_download_url(instance.file.name)
                return HttpResponseRedirect(download_url)
            except Exception as e:
                logger.error(f"Error retrieving file from Firebase: {e}")
                return Response({"error": "Failed to retrieve file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"detail": "Resource file not found."}, status=status.HTTP_404_NOT_FOUND)

    def update(self, request, *args, **kwargs):
        """
        Updates a resource.
        Handles file upload if a new file is provided.
        Only the instructor who created the resource can update it.

        Returns:
            Response: The response with the updated resource data.

        Raises:
            PermissionDenied: If the user is not authorized to update the resource.
            ValidationError: If the file is invalid.
            Exception: If an error occurs during the upload process.
        """
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        # Check if the user is authorized to update the resource
        if instance.uploaded_by != request.user:
            raise PermissionDenied("You do not have permission to update this resource.")

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        if "file" in request.data:
            try:
                file = request.data["file"]
                self.validate_file(file)
                blob_url = self.upload_to_firebase_storage(file)
                instance.file = blob_url
                instance.save()
            except ValidationError as e:
                logger.error(f"Validation Error: {e}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Upload Error: {e}")
                return Response(
                    {"error": "An error occurred during upload."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Deletes a resource.
        Only the instructor who created the resource can delete it.

        Returns:
            Response: The response with the deletion status.

        Raises:
            PermissionDenied: If the user is not authorized to delete the resource.
        """
        instance = self.get_object()
        if instance.uploaded_by != request.user:
            raise PermissionDenied("You do not have permission to delete this resource.")
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], permission_classes=[IsModerator])
    def strike(self, request, *args, **kwargs):
        """
        Flags a resource as inappropriate or flagged by users for deletion.
        Only moderators can perform this action.

        Returns:
            Response: The response with the status message.
        """
        resource = self.get_object()
        resource.status = "flagged_for_deletion"
        resource.save()
        return Response({"status": "Resource flagged for deletion successfully"})
