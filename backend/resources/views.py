import uuid
import logging
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from rest_framework import viewsets, permissions, parsers, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponseRedirect
from .models import Resource
from .serializers import ResourceSerializer
from .permissions import IsInstructorOrReadOnly, IsOwnerOrReadOnly
from .utils import FirebaseStorageHandler


# Setup logger
logger = logging.getLogger(__name__)

class ResourceViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing resources.

    This viewset provides CRUD operations (Create, Retrieve, Update, Delete) for resources.
    It also includes additional actions such as flagging a resource as inappropriate.

    Attributes:
        queryset (QuerySet): The queryset of resources.
        serializer_class (Serializer): The serializer class for resources.
        parser_classes (tuple): The parser classes for handling multipart/form-data requests.
        permission_classes (list): The permission classes required for accessing the viewset.
        uploaded_by (ForeignKey): The user who uploaded the resource.
        filter_backends (list): The filter backends for filtering resources.
        search_fields (list): The fields to search for resources.
        ordering_fields (list): The fields to order resources by.

    Methods:
        perform_create(serializer): Performs additional actions when creating a resource.
        validate_file(file): Validates the uploaded file.
        retrieve(request, *args, **kwargs): Retrieves a resource and redirects to the file download URL.
        strike(request, *args, **kwargs): Flags a resource as inappropriate.
        get_permissions(): Returns the list of permissions required for the viewset.
    """

    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]
    uploaded_by = permissions.IsAuthenticated
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["title", "upload_date"]

    def perform_create(self, serializer):
        """
        Performs additional actions when creating a resource.

        Args:
            serializer (Serializer): The serializer instance.

        Returns:
            None
        """
        file = serializer.validated_data.get("file")
        if file:
            self.validate_file(file)
            # Generate a unique, sanitized file name
            file_name = f"{uuid.uuid4()}-{file.name}"
            blob_url = FirebaseStorageHandler.upload_file(file, file_name)
            serializer.save(module_id=self.kwargs.get("module_pk"), uploaded_by=self.request.user, file=blob_url)
        else:
            serializer.save(module_id=self.kwargs.get("module_pk"), uploaded_by=self.request.user)

    def validate_file(self, file):
        """
        Validates the uploaded file.

        Args:
            file (File): The uploaded file.

        Raises:
            ValidationError: If the file is invalid.

        Returns:
            None
        """
        allowed_extensions = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "zip", "rar"]
        FileExtensionValidator(allowed_extensions=allowed_extensions)(file)

        max_file_size = 5 * 1024 * 1024  # 5MB
        if file.size > max_file_size:
            raise ValidationError(f"File size must be less than {max_file_size / (1024 * 1024)}MB.")

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieves a resource and redirects to the file download URL.

        Args:
            request (Request): The request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            HttpResponseRedirect: The HTTP redirect response.
            Response: The error response if the file retrieval fails.
        """
        instance = self.get_object()
        if instance.file:
            try:
                download_url = FirebaseStorageHandler.get_download_url(instance.file.name)
                return HttpResponseRedirect(download_url)
            except Exception as e:
                logger.error(f"Error retrieving file from Firebase: {e}")
                return Response({"detail": "Error retrieving file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"detail": "Resource file not found."}, status=status.HTTP_404_NOT_FOUND)


    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def strike(self, request, *args, **kwargs):
        """
        Flags a resource as inappropriate. Only admins can perform this action.

        Args:
            request (Request): The request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: The response indicating the resource has been flagged for deletion.
        """
        resource = self.get_object()
        resource.status = "flagged_for_deletion"
        resource.save()
        return Response({"status": "Resource flagged for deletion successfully"})

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.

        Returns:
            list: The list of permission instances.
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrReadOnly]
        else:
            permission_classes = self.permission_classes
        return [permission() for permission in permission_classes]