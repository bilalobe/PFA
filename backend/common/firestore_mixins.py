from django.db import models
from common.firebase_admin_init import db

class FirestoreDocumentMixin(models.Model):
    """
    Mixin for models that sync data to Firestore.
    """
    class Meta:
        abstract = True

    doc = None

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.doc:
            self.doc = db.collection(self._get_collection_name()).document(str(self.pk))
        self.sync_to_firestore()

    def delete(self, *args, **kwargs):
        if self.doc:
            self.doc.delete()
        super().delete(*args, **kwargs)

    def sync_to_firestore(self):
        if self.doc:
            self.doc.set(self.to_firestore_doc())

    def to_firestore_doc(self):
        raise NotImplementedError("Subclasses must implement to_firestore_doc method")

    def _get_collection_name(self):
        return f'{self.__class__.__name__.lower()}s'
    
class TimestampMixin(models.Model):
    """
    Mixin for adding created_at and updated_at timestamps to models.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class UserRelatedMixin(models.Model):
    """
    Mixin for models that are related to a User.
    """
    user = models.ForeignKey('User', on_delete=models.CASCADE)

    class Meta:
        abstract = True
