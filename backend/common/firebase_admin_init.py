import os
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

def initialize_firebase_admin():
    """
    Initializes the Firebase Admin SDK, handling potential errors.
    """
    try:
        # Attempt to get the already initialized app
        return firebase_admin.get_app() 
    except ValueError:
        # Initialize the app if it hasn't been initialized yet
        try:
            # Using a service account file (if available)
            cred = credentials.Certificate('path/to/your/serviceAccountKey.json') 
        except FileNotFoundError:
            # Using environment variables 
            cred = credentials.Certificate({
                "type": os.environ.get("FIREBASE_TYPE", ""),
                "project_id": os.environ.get("FIREBASE_PROJECT_ID", ""),
                "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID", ""),
                "private_key": os.environ.get("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
                "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL", ""),
                "client_id": os.environ.get("FIREBASE_CLIENT_ID", ""),
                "auth_uri": os.environ.get("FIREBASE_AUTH_URI", ""),
                "token_uri": os.environ.get("FIREBASE_TOKEN_URI", ""),
                "auth_provider_x509_cert_url": os.environ.get("FIREBASE_AUTH_PROVIDER_X509_CERT_URL", ""),
                "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_X509_CERT_URL", "")
            })

        app = firebase_admin.initialize_app(cred, {
            'storageBucket': os.environ.get("FIREBASE_STORAGE_BUCKET")
        })
        return app

# Initialize Firebase Admin SDK
app = initialize_firebase_admin()

# Export initialized services
db = firestore.client()
firebase_auth = auth
firebase_bucket = storage.bucket()