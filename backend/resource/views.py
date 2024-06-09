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
    """
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'upload_date']

    def get_queryset(self):
        """
        Returns a queryset that only includes resources associated with the requested module.
        """
        queryset = Resource.objects.all()
        module_id = self.request.GET.get('module')
        if module_id is not None:
            queryset = queryset.filter(module_id=module_id)
        return queryset

    def perform_create(self, serializer):
        """
        Handles the creation of a new resource, including file upload and validation.
        """
        try:
            file = serializer.validated_data.get('file')

            # Validate file extensions
            validator = FileExtensionValidator(allowed_extensions=['pdf'])
            validator(file)

            # Validate file size (limit to 5MB)
            if file.size > 5 * 1024 * 1024:
                raise ValidationError("File size exceeds the limit (5MB).")

            # Upload the file to Azure Blob Storage
            blob_service_client = BlobServiceClient.from_connection_string(os.environ.get('AZURE_STORAGE_CONNECTION_STRING'))
            blob_client = blob_service_client.get_blob_client(container=os.environ.get('AZURE_STORAGE_CONTAINER_NAME'), blob=file.name)
            blob_client.upload_blob(file, overwrite=True)

            # Update the file field with the Azure Blob Storage URL
            serializer.save(module_id=self.kwargs.get('module_pk'), uploaded_by=self.request.user, file=blob_client.url)

        except ValidationError as e:
            logger.error(f'Validation error occurred: {str(e)}')
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f'An error occurred during upload: {str(e)}')
            return Response({'error': f'An error occurred during upload: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        """
        Handles the creation of a new resource, including file upload and validation.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Updates a specific resource.
        Handles authorization and updates the resource URL if a new file is uploaded.
        """
        instance = self.get_object()

        # Check if the user is authorized to update the resource
        if instance.module.course.instructor != request.user:
            return Response({'detail': 'You are not authorized to update this resource.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Handle file upload if a new file is provided
        if 'file' in request.data:
            try:
                file = request.data['file']

                # Validate file extensions
                validator = FileExtensionValidator(allowed_extensions=['pdf'])
                validator(file)

                # Validate file size (limit to 5MB)
                if file.size > 5 * 1024 * 1024:
                    raise ValidationError("File size exceeds the limit (5MB).")

                # Upload the file to Azure Blob Storage
                blob_service_client = BlobServiceClient.from_connection_string(os.environ.get('AZURE_STORAGE_CONNECTION_STRING'))
                blob_client = blob_service_client.get_blob_client(container=os.environ.get('AZURE_STORAGE_CONTAINER_NAME'), blob=file.name)
                blob_client.upload_blob(file, overwrite=True)

                # Update the file field with the Azure Blob Storage URL
                instance.file = blob_client.url
                instance.save()

                serializer.instance = instance
                return Response(serializer.data)

            except ValidationError as e:
                logger.error(f'Validation error occurred: {str(e)}')
                return Response({'error': 'Validation error occurred.'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f'An error occurred during upload: {str(e)}')
                return Response({'error': 'An error occurred during upload.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Update other fields if a file is not provided
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Deletes a specific resource.
        Handles authorization.
        """
        instance = self.get_object()

        # Check if the user is authorized to delete the resource
        if instance.module.course.instructor != request.user:
            return Response({'detail': 'You are not authorized to delete this resource.'}, status=status.HTTP_403_FORBIDDEN)

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
