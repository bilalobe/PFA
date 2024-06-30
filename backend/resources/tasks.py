import os
from firebase_admin import storage
from celery import shared_task
from vt import Client
from .models import Resource
from PIL import Image
import io
import logging
from django.core.cache import cache

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def process_uploaded_resource(self, resource_id):
    """
    Processes an uploaded resource: scans for viruses and generates a thumbnail (if applicable).
    """
    resource = Resource.objects.get(pk=resource_id)
    bucket = storage.bucket()

    # 1. Virus Scan with VirusTotal
    virustotal_api_key = os.environ.get("VIRUSTOTAL_API_KEY")
    if not virustotal_api_key:
        raise ValueError("VIRUSTOTAL_API_KEY environment variable is not set.")
    
    # Check cache for previous scan results
    cache_key = f"virus_scan_{resource_id}"
    results = cache.get(cache_key)
    
    if not results:
        try:
            blob = bucket.blob(resource.file.name)
            # Process file directly in memory
            file_bytes = blob.download_as_bytes()
            with Client(virustotal_api_key) as client:
                analysis = client.scan_file(io.BytesIO(file_bytes), wait_for_completion=True)
            results = analysis.last_analysis_results
            cache.set(cache_key, results, timeout=86400)  # Cache results for 24 hours
            logger.info(f"VirusTotal scan results for resource {resource.id}: {results}")
        except Exception as e:
            logger.error(f"Error scanning file with VirusTotal: {e}")
            self.retry(exc=e, countdown=60)  # Retry after 60 seconds

    # 2. Thumbnail Generation (if applicable)
    if resource.file_type.startswith("image/") and not resource.thumbnail:
        generate_thumbnail(resource_id)

def generate_thumbnail(resource_id):
    """
    Generates a thumbnail for an image resource and uploads it to Firebase Storage.
    """
    resource = Resource.objects.get(pk=resource_id)
    bucket = storage.bucket()

    try:
        blob = bucket.blob(resource.file.name)
        # Process image directly in memory
        image_bytes = blob.download_as_bytes()
        image = Image.open(io.BytesIO(image_bytes))
        image.thumbnail((200, 200))

        # Convert PIL image to bytes for upload
        thumb_io = io.BytesIO()
        image.save(thumb_io, 'JPEG', quality=85)
        thumb_io.seek(0)

        # Upload thumbnail to Firebase Storage
        thumbnail_blob = bucket.blob(f'thumbnails/{resource.id}.jpg')
        thumbnail_blob.upload_from_file(thumb_io, content_type='image/jpeg')
        resource.thumbnail_url = thumbnail_blob.public_url
        resource.save()

    except Exception as e:
        logger.error(f"Error generating thumbnail: {e}")