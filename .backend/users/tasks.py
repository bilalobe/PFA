import firebase_admin
from firebase_admin import credentials, firestore, storage
from PIL import Image
from io import BytesIO
import logging

# Initialize Firebase Admin SDK
cred = credentials.Certificate('path/to/your/serviceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'your-project-id.appspot.com'
})
db = firestore.client()
bucket = storage.bucket()


def resize_profile_picture(user_id, image_field_name):
    """
    Resizes the profile picture to a smaller size (e.g., 200x200) while preserving aspect ratio,
    and updates the Firestore document with the new image URL. Adds a check for file size to prevent
    resizing of excessively large images. Supports multiple image formats.
    """
    user_ref = db.collection('users').document(user_id)

    try:
        user_doc = user_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            if user_data:
                image_path = user_data.get(image_field_name)

                if image_path:
                    # Download the image from Firebase Storage
                    blob = bucket.blob(image_path)
                    
                    # Check file size before downloading
                    blob.reload()  # Load metadata
                    if blob.size is not None and blob.size > 5242880:  # 5MB in bytes
                        logging.warning(f"Image file size is too large to process: {blob.size} bytes.")
                        return
                    
                    img_data = blob.download_as_bytes()
                    img = Image.open(BytesIO(img_data))

                    # Resize the image
                    if img.width > 200 or img.height > 200:
                        img.thumbnail((200, 200))
                        buffer = BytesIO()
                        img.save(buffer, format=img.format)
                        buffer.seek(0)

                        # Determine content_type based on image format
                        if img.format:
                            content_type = f'image/{img.format.lower()}'
                        else:
                            content_type = 'image/jpeg'  # or any default content type you prefer

                        # Upload the resized image back to Firebase Storage
                        new_image_path = f'resized_images/{user_id}/{image_field_name}'
                        new_blob = bucket.blob(new_image_path)
                        new_blob.upload_from_string(buffer.getvalue(), content_type=content_type)

                        # Update Firestore document with the new image path
                        user_ref.update({image_field_name: new_image_path})
                else:
                    logging.info(f"User {user_id} does not have a profile picture.")
            else:
                logging.error(f"User document with ID {user_id} does not have any data.")
        else:
            logging.error(f"User document with ID {user_id} does not exist.")
    except Exception as e:
        logging.error(f"Error resizing profile picture: {e}")
        raise