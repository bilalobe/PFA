from django.db import models
from common.firebase_admin_init import db

class FirestoreDocumentMixin(models.Model):
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