import os
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
import logging

logging.basicConfig(level=logging.INFO)

def initialize_firebase_admin():
    """
    Initializes the Firebase Admin SDK, handling potential errors.

    This function attempts to get the already initialized app. If the app has not been initialized yet,
    it checks if a service account file is available. If the file is found, it uses the service account
    credentials to initialize the app. If the file is not found, it falls back to using environment variables
    to retrieve the necessary credentials.

    Returns:
        firebase_admin.App: The initialized Firebase Admin app.

    Raises:
        FileNotFoundError: If the service account file is not found.
    """
    try:
        return firebase_admin.get_app() 
    except ValueError:
        try:
            cred = credentials.Certificate('path/to/your/serviceAccountKey.json') 
        except FileNotFoundError:
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