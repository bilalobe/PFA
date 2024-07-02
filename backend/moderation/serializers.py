from rest_framework import serializers
from firebase_admin import firestore
from google.cloud.firestore import DocumentReference, SERVER_TIMESTAMP

class ModerationReportSerializer(serializers.Serializer):
    report_id = serializers.CharField(read_only=True)
    content_id = serializers.CharField(required=True)
    content_type = serializers.ChoiceField(choices=['post', 'comment', 'user'], required=True)
    reason = serializers.CharField(required=True)
    reported_by = serializers.CharField(required=True)
    status = serializers.ChoiceField(choices=['pending', 'reviewed', 'resolved'], default='pending')
    created_at = serializers.DateTimeField(read_only=True, default=SERVER_TIMESTAMP)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        db = firestore.client()
        report_ref = db.collection('moderation_reports').document()
        report_data = {
            **validated_data,
            'report_id': report_ref.id,
            'created_at': SERVER_TIMESTAMP,
            'updated_at': SERVER_TIMESTAMP
        }
        report_ref.set(report_data)
        return report_data

    def update(self, instance, validated_data):
        db = firestore.client()
        report_ref = db.collection('moderation_reports').document(instance['report_id'])
        validated_data['updated_at'] = SERVER_TIMESTAMP
        report_ref.update(validated_data)
        return validated_data