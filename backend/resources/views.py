import os
import logging
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from rest_framework import viewsets, permissions, parsers, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from boto3.session import Session
from botocore.exceptions import NoCredentialsError
from django.http import HttpResponseRedirect
from django.contrib.auth import get_user_model
from backend.resources.permissions import IsModerator
from .models import Resource
from .serializers import ResourceSerializer

# Setup logger
logger = logging.getLogger(__name__)

# Get the custom user model
User = get_user_model()


class ResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing resources.
    Only instructors can create, update, and delete resources.
    Enrolled students can only view resources associated with their courses.
    """

    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    permission_classes = [
        permissions.IsAuthenticated
    ]  # All users need to be authenticated
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
        if module_id is not None:
            queryset = queryset.filter(module_id=module_id)

        user = self.request.user
        if user.is_authenticated:
            userprofile = getattr(user, "userprofile", None)
            if userprofile and userprofile.user_type == "student":
                enrolled_courses = userprofile.enrollments.values_list(
                    "course", flat=True
                )
                queryset = queryset.filter(module__course__in=enrolled_courses)

        return queryset

    def perform_create(self, serializer):
        """
        Handles resource creation, including file upload, validation, and saving to AWS.
        Only instructors can create resources.
        """
        user = self.request.user
        userprofile = getattr(user, "userprofile", None)
        if not userprofile or userprofile.user_type != "teacher":
            raise PermissionDenied("Only instructors can upload resources.")

        try:
            file = serializer.validated_data["file"]
            self.validate_file(file)
            blob_url = self.upload_to_s3(file)
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
        """
        allowed_extensions = [
            "pdf",
            "doc",
            "docx",
            "ppt",
            "pptx",
            "xls",
            "xlsx",
            "txt",
            "zip",
            "rar",
        ]
        validator = FileExtensionValidator(allowed_extensions=allowed_extensions)
        validator(file)

        max_file_size = 5 * 1024 * 1024  # 5MB
        if file.size > max_file_size:
            raise ValidationError(
                f"File size must be less than {max_file_size / (1024 * 1024)}MB."
            )

    def upload_to_s3(self, file):
        """
        Uploads the file to AWS S3 and returns the file URL.
        """
        try:
            session = Session(
                aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
                region_name=os.environ.get("AWS_REGION"),
            )
            s3 = session.resource("s3")
            bucket_name = os.environ.get("AWS_STORAGE_BUCKET_NAME")
            s3.Bucket(bucket_name).upload_fileobj(Fileobj=file, Key=file.name)
            file_url = f"https://{bucket_name}.s3.{os.environ.get('AWS_REGION')}.amazonaws.com/{file.name}"
            return file_url
        except NoCredentialsError as e:
            logger.error(f"Credentials Error: {e}")
            raise

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        user = request.user
        userprofile = getattr(user, "userprofile", None)
        if userprofile and userprofile.user_type == "student":
            self.check_object_permissions(request, instance)

        instance.download_count += 1
        instance.save()

        if instance.file:
            session = Session(
                aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
                region_name=os.environ.get("AWS_REGION"),
            )
            s3 = session.client("s3")
            presigned_url = s3.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": os.environ.get("AWS_STORAGE_BUCKET_NAME"),
                    "Key": instance.file.name,
                },
                ExpiresIn=3600,
            )
            return HttpResponseRedirect(presigned_url)
        else:
            return Response(
                {"detail": "Resource file not found."}, status=status.HTTP_404_NOT_FOUND
            )

    def update(self, request, *args, **kwargs):
        """
        Updates a resource.
        Handles file upload if a new file is provided.
        Only the instructor who created the resource can update it.
        """
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        # Check if the user is authorized to update the resource
        if instance.uploaded_by != request.user:
            raise PermissionDenied(
                "You do not have permission to update this resource."
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        if "file" in request.data:
            try:
                file = request.data["file"]
                self.validate_file(file)
                blob_url = self.upload_to_s3(file)
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
        """
        instance = self.get_object()

        if instance.uploaded_by != request.user:
            raise PermissionDenied(
                "You do not have permission to delete this resource."
            )

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], permission_classes=[IsModerator])
    def strike(self, request, *args, **kwargs):
        """
        Flags a resource as inappropriate or flagged by users for deletion.
        Only moderators can perform this action.
        """
        resource = self.get_object()

        # Assuming there's a 'status' field in the Resource model.
        resource.status = "flagged_for_deletion"
        resource.save()

        # Log the action or notify administrators if necessary.

        return Response({"status": "Resource flagged for deletion successfully"})
