""" from django.db import models
from django.conf import settings
from courses.models import Module
from google.cloud import firestore

def resource_directory_path(instance, filename):
    # Use a setting from settings.py for base upload path if applicable
    base_upload_path = getattr(settings, "RESOURCE_UPLOAD_BASE_PATH", "uploads/")
    return f"{base_upload_path}course_{instance.module.course.id}/module_{instance.module.id}/{filename}"


class Resource(models.Model):
    Represents a resource uploaded to the system.

    Attributes:
        id (AutoField): The primary key for the resource.
        module (ForeignKey): The module to which the resource belongs.
        uploaded_by (ForeignKey): The user who uploaded the resource.
        title (CharField): The title of the resource.
        description (TextField): The description of the resource.
        file (FileField): The file associated with the resource.
        file_type (CharField): The type of the file.
        file_size (PositiveIntegerField): The size of the file in bytes.
        upload_date (DateTimeField): The date and time when the resource was uploaded.
        download_count (PositiveIntegerField): The number of times the resource has been downloaded.
        thumbnail (ImageField): The thumbnail image associated with the resource.

    id = models.AutoField(primary_key=True)
    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name="resources"
    )
    uploaded_by = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="resources_uploaded"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to=resource_directory_path)
    file_type = models.CharField(max_length=50, blank=True)  # Store file type
    file_size = models.PositiveIntegerField(default=0)  # Store file size in bytes
    upload_date = models.DateTimeField(auto_now_add=True)
    download_count = models.PositiveIntegerField(default=0)
    thumbnail = models.ImageField(upload_to="thumbnails/", blank=True, null=True)
    thumbnail_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.title

    
    def save(self, *args, **kwargs):
        # Calculate and store file size on save
        if self.file:
            self.file_size = self.file.size
            # Ensure file_type is determined correctly; might need manual handling
            self.file_type = self.file.file.content_type
    
        super().save(*args, **kwargs)  # Call the original save method
    
        # Update Firestore document in a transaction
        db = firestore.Client()
        doc_ref = db.collection("resources").document(str(self.id))
    
        @firestore.transactional
        def update_in_transaction(transaction, doc_ref, data):
            transaction.set(doc_ref, data)
    
        transaction = db.transaction()
        update_in_transaction(transaction, doc_ref, {
            "title": self.title,
            "description": self.description,
            "file_type": self.file_type,
            "file_size": self.file_size,
            "upload_date": self.upload_date.strftime("%Y-%m-%d %H:%M:%S"),
            "download_count": self.download_count,
        }) """