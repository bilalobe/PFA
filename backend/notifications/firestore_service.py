from google.cloud import firestore

db = firestore.Client()

class FirestoreNotificationService:
    @staticmethod
    def save_notification(user_id, message, notification_type):
        notification_ref = db.collection('notifications').document()
        notification_ref.set({
            'user_id': user_id,
            'message': message,
            'type': notification_type,
            'status': 'pending'
        })

    @staticmethod
    def get_user_preferences(user_id):
        # Fetch user preferences from Firestore
        preferences_ref = db.collection('user_preferences').document(user_id)
        doc = preferences_ref.get()
        if doc.exists:
            return doc.to_dict()
        return {}
    
    @staticmethod
    def update_notification(notification_id, updates):
        """
        Updates a notification document in the Firestore database.

        Args:
            notification_id (str): The ID of the notification document to update.
            updates (dict): A dictionary of fields to update.
        """
        notification_ref = db.collection('notifications').document(notification_id)
        notification_ref.update(updates)


class FirestoreReviewService:
    db = firestore.Client()

    @staticmethod
    def is_user_enrolled_in_course(user_id, course_id):
        user_ref = FirestoreReviewService.db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            if user_data:  # Ensure user_data is not None
                return course_id in user_data.get('enrollments', [])
        return False

    @staticmethod
    def has_user_liked_review(user_id, review_id):
        likes_ref = FirestoreReviewService.db.collection('review_likes').document(f'{user_id}_{review_id}')
        return likes_ref.get().exists

    @staticmethod
    def like_review(user_id, review_id):
        likes_ref = FirestoreReviewService.db.collection('review_likes').document(f'{user_id}_{review_id}')
        likes_ref.set({
            'user_id': user_id,
            'review_id': review_id
        })

    @staticmethod
    def dislike_review(user_id, review_id):
        likes_ref = FirestoreReviewService.db.collection('review_likes').document(f'{user_id}_{review_id}')
        likes_ref.delete()
