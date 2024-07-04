from google.cloud import firestore

db = firestore.Client()

class FirestoreNotificationService:
    @staticmethod
    def save_notification(user_id, message, notification_type):
        """Saves a new notification to the Firestore database."""
        notification_ref = db.collection('notifications').document()
        notification_ref.set({
            'user_id': user_id,
            'message': message,
            'type': notification_type,
            'status': 'pending'
        })

    @staticmethod
    def get_user_preferences(user_id):
        """Retrieves user preferences from the Firestore database."""
        preferences_ref = db.collection('user_preferences').document(user_id)
        doc = preferences_ref.get()
        if doc.exists:
            return doc.to_dict()
        return {}
    
    @staticmethod
    def update_notification(notification_id, updates):
        """Updates a notification document in the Firestore database."""
        notification_ref = db.collection('notifications').document(notification_id)
        notification_ref.update(updates)

class FirestoreReviewService:
    @staticmethod
    def is_user_enrolled_in_course(user_id, course_id):
        """Checks if a user is enrolled in a specific course."""
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            enrollments = user_data.get('enrollments') if user_data else []
            return course_id in enrollments
        return False

    @staticmethod
    def has_user_liked_review(user_id, review_id):
        """Checks if a user has liked a specific review."""
        likes_ref = db.collection('review_likes').document(f'{user_id}_{review_id}')
        return likes_ref.get().exists

    @staticmethod
    def like_review(user_id, review_id):
        """Records a user's like for a specific review."""
        likes_ref = db.collection('review_likes').document(f'{user_id}_{review_id}')
        likes_ref.set({
            'user_id': user_id,
            'review_id': review_id
        })

    @staticmethod
    def dislike_review(user_id, review_id):
        """Removes a user's like for a specific review."""
        likes_ref = db.collection('review_likes').document(f'{user_id}_{review_id}')
        likes_ref.delete()