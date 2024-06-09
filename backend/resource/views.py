import os
import logging
from rest_framework import viewsets, permissions, parsers, status, filters
from rest_framework.response import Response
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from azure.storage.blob import BlobServiceClient
from .models import Resource
from .serializers import ResourceSerializer
from .permissions import IsInstructor, IsEnrolledStudent

logger = logging.getLogger(__name__)

class ResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing resources.
    Only instructors can create, update, and delete resources.
    Enrolled students can only view resources associated with their courses.
    """
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)  # Handle file uploads
    permission_classes = [permissions.IsAuthenticated & IsInstructor]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'upload_date']

    def get_queryset(self):
        """
        Returns a queryset filtered by module if the 'module' query parameter is provided.
        For enrolled students, only resources associated with their enrolled courses are returned.
        """
        queryset = super().get_queryset()
        module_id = self.request.query_params.get('module')
        if module_id is not None:
            queryset = queryset.filter(module_id=module_id)

        if self.request.user.user_type == 'student':
            # Filter resources to only include those from enrolled courses
            enrolled_courses = self.request.user.enrollments.values_list('course', flat=True)
            queryset = queryset.filter(module__course__in=enrolled_courses)

        return queryset

    def perform_create(self, serializer):
        """
        Handles resource creation, including file upload, validation, and saving to Azure.
        Only instructors can create resources.
        """
        if self.request.user.user_type != 'teacher':
            raise PermissionDenied("Only instructors can upload resources.")

        try:
            file = serializer.validated_data['file']
            self.validate_file(file)
            blob_url = self.upload_to_azure(file)
            serializer.save(
                module_id=self.kwargs.get('module_pk'),
                uploaded_by=self.request.user,
                file=blob_url
            )
        except ValidationError as e:
            logger.error(f"Validation Error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Upload Error: {e}")
            return Response({'error': 'An error occurred during upload.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def validate_file(self, file):
        """
        Validates the uploaded file for allowed extensions and size limit.
        """
        allowed_extensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'zip', 'rar']  # Add more as needed
        validator = FileExtensionValidator(allowed_extensions=allowed_extensions)
        validator(file)

        max_file_size = 5 * 1024 * 1024  # 5MB
        if file.size > max_file_size:
            raise ValidationError(f"File size must be less than {max_file_size / (1024 * 1024)}MB.")

    def upload_to_azure(self, file):
        """
        Uploads the file to Azure Blob Storage and returns the blob URL.
        """
        blob_service_client = BlobServiceClient.from_connection_string(os.environ.get('AZURE_STORAGE_CONNECTION_STRING'))
        blob_client = blob_service_client.get_blob_client(
            container=os.environ.get('AZURE_STORAGE_CONTAINER_NAME'),
            blob=file.name
        )
        blob_client.upload_blob(file, overwrite=True)
        return blob_client.url

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieves a resource. Ensures enrolled students can only access resources from their courses.
        """
        instance = self.get_object()
        if self.request.user.user_type == 'student':
            self.check_object_permissions(request, instance)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """
        Updates a resource.
        Handles file upload if a new file is provided.
        Only the instructor who created the resource can update it.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Check if the user is authorized to update the resource
        if instance.uploaded_by != request.user:
            raise PermissionDenied("You do not have permission to update this resource.")

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        if 'file' in request.data:
            try:
                file = request.data['file']
                self.validate_file(file)
                blob_url = self.upload_to_azure(file)
                instance.file = blob_url
                instance.save()
            except ValidationError as e:
                logger.error(f"Validation Error: {e}")
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Upload Error: {e}")
                return Response({'error': 'An error occurred during upload.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Deletes a resource.
        Only the instructor who created the resource can delete it.
        """
        instance = self.get_object()

        if instance.uploaded_by != request.user:
            raise PermissionDenied("You do not have permission to delete this resource.")

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)