import logging
from django.core.cache import cache
from rest_framework.response import Response
from textblob import TextBlob
from textblob.exceptions import NotTranslated
from google.cloud import firestore,exceptions

from backend.common.exceptions import TranslationError


class TranslationService:
    def __init__(self, source_text, translated_text, source_language, target_language):
        self.source_text = source_text
        self.translated_text = translated_text
        self.source_language = source_language
        self.target_language = target_language
        self.firestore_client = firestore.Client()

    def to_firestore_doc(self):
        """
        Converts the translation to a dictionary representation for Firestore.

        Returns:
            dict: A dictionary representation of the translation.
        """
        return {
            "source_text": self.source_text,
            "translated_text": self.translated_text,
            "source_language": self.source_language,
            "target_language": self.target_language,
        }
    
    def save(self):
        transaction = self.firestore_client.transaction()
        try:
            @firestore.transactional
            def save_in_transaction(transaction, translation_service):
                doc_ref = self.firestore_client.collection('translations').document()
                transaction.set(doc_ref, translation_service.to_firestore_doc())
            save_in_transaction(transaction, self)
            logging.info("Translation saved to Firestore successfully.")
        except exceptions.GoogleCloudError as e:  # Using GoogleCloudError
            logging.error(f"Failed to save translation to Firestore: {e}")
            raise TranslationError(detail="Failed to save translation.")
    
    def delete(self, document_id):
        transaction = self.firestore_client.transaction()
        try:
            @firestore.transactional
            def delete_in_transaction(transaction, document_id):
                doc_ref = self.firestore_client.collection('translations').document(document_id)
                transaction.delete(doc_ref)
            delete_in_transaction(transaction, document_id)
            logging.info("Translation deleted from Firestore successfully.")
        except exceptions.GoogleCloudError as e:  # Using GoogleCloudError
            logging.error(f"Failed to delete translation from Firestore: {e}")
            raise TranslationError(detail="Failed to delete translation.")

        delete_in_transaction(transaction, document_id)

    def translate(self, post_content, target_language):
        """
        Translates the given text to the specified language.

        Args:
            post_content (str): The text to be translated.
            target_language (str): The target language code (e.g., 'es' for Spanish).

        Returns:
            Response: The HTTP response object containing the translated text or an error message.

        Raises:
            NotTranslated: If the text cannot be translated.
            Exception: If an error occurs during translation.

        Example:
            >>> post_content = "Hello"
            >>> target_language = "es"
            >>> response = translate_text(post_content, target_language)
            >>> print(response.data)
            {
                "translated_text": "Hola"
            }

        """
        if not post_content or not target_language:
            return Response({"error": "Missing text or target language."}, status=400)

        # Construct cache key
        cache_key = f"translation_{post_content}_{target_language}"
        # Attempt to fetch the translated text from cache
        cached_translation = cache.get(cache_key)

        if cached_translation:
            return Response({"translated_text": cached_translation})

        try:
            # Perform translation
            translated_text = str(TextBlob(post_content).translate(to=target_language))
            # Cache the translated text
            cache.set(cache_key, translated_text, timeout=3600)  # Cache for 1 hour
            return Response({"translated_text": translated_text})
        except NotTranslated:
            return Response({"error": "Text could not be translated."}, status=422)
        except Exception as e:
            return Response({"error": f"Translation failed due to an error: {e}"}, status=500)
