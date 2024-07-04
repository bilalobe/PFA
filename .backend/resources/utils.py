import datetime
from common.firebase_admin_init import firebase_bucket

class FirebaseStorageHandler:
    @staticmethod
    def upload_file(file, file_name):
        """
        Uploads a file to Firebase Storage.

        :param file: File object to upload.
        :param file_name: The name of the file in the storage.
        :return: URL to the uploaded file.
        """
        # Use the imported firebase_bucket instead of getting it again
        bucket = firebase_bucket

        # Create a blob in the bucket
        blob = bucket.blob(file_name)

        # Upload the file
        blob.upload_from_string(
            file.read(),
            content_type=file.content_type
        )

        # Make the blob publicly viewable
        blob.make_public()

        # Return the blob's URL
        return blob.public_url

    @staticmethod
    def get_download_url(file_name):
        """
        Generates a download URL for a file stored in Firebase Storage.

        :param file_name: The name of the file in the storage.
        :return: Download URL for the file.
        """
        # Use the imported firebase_bucket instead of getting it again
        bucket = firebase_bucket

        # Create a blob in the bucket
        blob = bucket.blob(file_name)

        # Generate a download URL
        url = blob.generate_signed_url(
            expiration=datetime.timedelta(seconds=300),  # URL expires in 5 minutes
            method='GET'
        )

        return url