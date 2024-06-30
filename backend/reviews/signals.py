from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Review, ReviewLike
from firebase_admin import firestore

db = firestore.client()

def get_firestore_doc_ref(collection_name, doc_id):
    """Get Firestore document reference."""
    return db.collection(collection_name).document(str(doc_id))

@receiver(post_delete, sender=Review)
@receiver(post_delete, sender=ReviewLike)
def delete_firestore_document(instance, **_):
    """
    Deletes the corresponding Firestore document when a Review or ReviewLike instance is deleted.
    
    Args:
        instance: The instance of the Review or ReviewLike model being deleted.
    """
    try:
        if hasattr(instance, 'doc') and instance.doc:
            instance.doc.delete()
    except Exception:
        pass

@receiver(post_save, sender=Review)
def sync_review_to_firestore(instance, **_):
    """Sync Review instance to Firestore."""
    doc_ref = get_firestore_doc_ref('reviews', instance.id)
    doc_ref.set(instance.to_firestore_doc())

@receiver(post_save, sender=ReviewLike)
def sync_review_like_to_firestore(instance, **_):
    """Sync ReviewLike instance to Firestore."""
    doc_ref = get_firestore_doc_ref('review_likes', instance.id)
    doc_ref.set(instance.to_firestore_doc())

@receiver(post_delete, sender=Review)
def delete_review_from_firestore(instance, **_):
    """Delete Review document from Firestore."""
    get_firestore_doc_ref('reviews', instance.id).delete()

@receiver(post_delete, sender=ReviewLike)
def delete_review_like_from_firestore(instance, **_):
    """Delete ReviewLike document from Firestore."""
    get_firestore_doc_ref('review_likes', instance.id).delete()