import logging
from typing import List, Optional
from common.firebase_admin_init import db
from google.cloud.firestore_v1.base_document import DocumentSnapshot
from google.cloud.exceptions import NotFound
from rest_framework import serializers  # Import DRF serializers

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TagSerializer:
    """
    A class that provides serialization and deserialization methods for Tag objects.
    """

    @staticmethod
    def serialize(document: DocumentSnapshot) -> dict:
        """
        Serializes a DocumentSnapshot object into a dictionary.

        Args:
            document (DocumentSnapshot): The DocumentSnapshot object to be serialized.

        Returns:
            dict: The serialized dictionary representation of the DocumentSnapshot object.
        """
        if document.exists:
            return document.to_dict() or {}
        return {}

    @staticmethod
    def deserialize(data: dict) -> dict:
        """
        Deserializes a dictionary into a DocumentSnapshot object.

        Args:
            data (dict): The dictionary to be deserialized.

        Returns:
            dict: The deserialized DocumentSnapshot object.
        """
        return data

class ThreadSerializer:
    """
    Serializes thread data from a DocumentSnapshot object.
    """

    id = serializers.IntegerField()
    title = serializers.CharField()
    summary = serializers.CharField()

    @classmethod
    def serialize(cls, document: DocumentSnapshot) -> dict:
        """
        Serializes the given DocumentSnapshot object into a dictionary.

        Args:
            document (DocumentSnapshot): The DocumentSnapshot object to be serialized.

        Returns:
            dict: The serialized thread data.
        """
        if not document.exists:
            return {}
        thread_data = document.to_dict() or {}
        tag_ids = thread_data.get('tags', [])
        tags = cls._serialize_tags(tag_ids)
        thread_data['tags'] = tags
        thread_data.update({
            'post_count': len(thread_data.get('posts', [])),
            'is_subscribed': False,
            'vote_score': 0,
        })
        return thread_data

    @staticmethod
    def _serialize_tags(tag_ids: List[str]) -> List[dict]:
        """
        Serializes the tags associated with the thread.

        Args:
            tag_ids (List[str]): The list of tag IDs.

        Returns:
            List[dict]: The serialized tag data.
        """
        tags = []
        try:
            tag_docs = [db.collection('tags').document(tag_id).get() for tag_id in tag_ids]
            tags = [TagSerializer.serialize(tag_doc) for tag_doc in tag_docs if tag_doc.exists]
        except NotFound as e:
            logger.error(f"Tag not found: {e}")
        except Exception as e:
            logger.error(f"Error serializing tags: {e}")
        return tags

class ThreadCreateSerializer:
    @staticmethod
    def deserialize(data: dict) -> dict:
        tags_data = data.pop('tags', [])
        tags_refs = [db.collection('tags').document(tag_id) for tag_id in tags_data]
        data['tags'] = tags_refs
        return data

def create_thread(data: dict) -> Optional[str]:
    try:
        serialized_data = ThreadCreateSerializer.deserialize(data)
        thread_ref = db.collection('threads').add(serialized_data)
        thread_id = thread_ref[1].id

        return thread_id
    except Exception as e:
        logger.error(f"Failed to create thread: {e}")
        return None