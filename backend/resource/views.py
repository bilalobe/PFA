import os
from rest_framework import viewsets, permissions, parsers, status, filters
from rest_framework.response import Response
from .models import Resource
from .serializers import ResourceSerializer
from .permissions import IsInstructor, IsEnrolledStudent
from azure.storage.blob import BlobServiceClient, BlobClient
from django.core.exceptions import ValidationError

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)  # For handling file uploads
    permission_classes = [permissions.IsAuthenticated] # Only authenticated users

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'upload_date']

    def get_queryset(self):
        queryset = Resource.objects.all()
        module_id = self.request.query_params.get('module')
        if module_id is not None:
            queryset = queryset.filter(module_id=module_id)
        return queryset

    def perform_create(self, serializer):
        try:
            # Get the file object from the serializer
            file = serializer.validated_data.get('file')
            
            # Validate file type
            if not file.content_type.startswith('application/pdf'):
                raise ValidationError('Only PDF files are allowed.')
            
            # Validate file size (e.g., limit to 10MB)
            if file.size > 10 * 1024 * 1024:
                raise ValidationError('File size should not exceed 10MB.')

            # Save the serializer
            serializer.save(module_id=self.kwargs.get('module_pk'), uploaded_by=self.request.user)

            # Upload the file to Azure Blob Storage
            blob_service_client = BlobServiceClient.from_connection_string(os.environ.get('AZURE_STORAGE_CONNECTION_STRING'))
            blob_client = blob_service_client.get_blob_client(container=os.environ.get('AZURE_STORAGE_CONTAINER_NAME'), blob=file.name)
            blob_client.upload_blob(file, overwrite=True)

            # Update the file field with the Azure Blob Storage URL
            serializer.instance.file = blob_client.url
            serializer.instance.save()

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'An error occurred during upload: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Check if the user is the instructor of the course associated with the resource
        if instance.module.cours.instructor != request.user:
            return Response({'detail': 'You are not authorized to update this resource.'}, status=status.HTTP_403_FORBIDDEN)
        # ... (rest of your update logic)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Check if the user is the instructor of the course associated with the resource
        if instance.module.cours.instructor != request.user:
            return Response({'detail': 'You are not authorized to delete this resource.'}, status=status.HTTP_403_FORBIDDEN)
        # ... (rest of your delete logic)
