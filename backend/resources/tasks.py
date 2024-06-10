import os
from celery import shared_task
from vt import Client
from .models import Resource
from PIL import Image
from django.conf import settings 
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def process_uploaded_resource(self, resource_id):
    """
    Processes an uploaded resource: scans for viruses and generates a thumbnail (if applicable).
    """
    resource = Resource.objects.get(pk=resource_id)

    # 1. Virus Scan with VirusTotal
    virustotal_api_key = os.environ.get('VIRUSTOTAL_API_KEY')
    if not virustotal_api_key:
        raise ValueError("VIRUSTOTAL_API_KEY environment variable is not set.")
    with Client(virustotal_api_key) as client:
        try:
            with open(resource.file.path, 'rb') as file:
                analysis = client.scan_file(file, wait_for_completion=True)
            results = analysis.last_analysis_results
            # Handle VirusTotal results (e.g., log, store in database, take action)
            # Example logging
            logger.info(f"VirusTotal scan results for resource {resource.id}: {results}")
        except Exception as e:
            logger.error(f"Error scanning file with VirusTotal: {e}")
            self.retry(exc=e, countdown=60)  # Retry after 60 seconds

    # 2. Thumbnail Generation (if applicable)
    if resource.file_type.startswith('image/'):
        generate_thumbnail(resource_id)

def generate_thumbnail(resource_id):
    """
    Generates a thumbnail for an image resource.
    """
    resource = Resource.objects.get(pk=resource_id)

    try:
        image = Image.open(resource.file.path)
        image.thumbnail((200, 200)) 
        thumbnail_path = os.path.join(settings.MEDIA_ROOT, 'thumbnails', f"{resource.id}.jpg") 

        # Ensure the 'thumbnails' directory exists
        os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)  

        image.save(thumbnail_path, 'JPEG')

        # Update the Resource model with the thumbnail path (relative to MEDIA_ROOT)
        resource.thumbnail.name = os.path.join('thumbnails', f"{resource.id}.jpg") 
        resource.save()

    except Exception as e:
        logger.error(f"Error generating thumbnail: {e}")