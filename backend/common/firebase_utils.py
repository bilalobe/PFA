import os
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
import logging
import requests

logging.basicConfig(level=logging.INFO)

class FirebaseServices:
    def __init__(self):
        self.app = self.initialize_firebase_admin()
        self.db = firestore.client()
        self.firebase_auth = auth
        self.firebase_bucket = storage.bucket()

    def initialize_firebase_admin(self):
        """
        Initializes the Firebase Admin SDK.
        """
        try:
            return firebase_admin.get_app()
        except ValueError:
            try:
                cred = credentials.Certificate('../../../serviceAccountKey.json')
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
            logging.info("Firebase Admin initialized successfully.")
            return app

    def verify_app_check_token(self, app_check_token, project_id):
        """
        Verifies the Firebase App Check token.
        """
        url = f"https://firebaseappcheck.googleapis.com/v1/projects/{project_id}/apps/-/exchangeAppAttestAttestation:exchange"
        headers = {
            "Authorization": "Bearer " + app_check_token,
            "Content-Type": "application/json",
        }
        try:
            response = requests.post(url, headers=headers)
            return response.status_code == 200
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to verify App Check token: {e}")
            return False

firebase_services = FirebaseServices()