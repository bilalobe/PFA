import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import SERVER_TIMESTAMP

# Initialize Firestore
cred = credentials.Certificate('path/to/your/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

class ThreadFirestore:
    def __init__(self, title, forum_path, created_by_path, **kwargs):
        self.title = title
        self.forum_path = forum_path  # Path to the Forum document
        self.created_by_path = created_by_path  # Path to the User document who created the thread
        self.created_at = SERVER_TIMESTAMP  # Use Firestore server timestamp
        self.is_closed = kwargs.get('is_closed', False)
        self.closed_by_path = kwargs.get('closed_by_path', None)  # Path to the User document who closed the thread
        self.closed_at = kwargs.get('closed_at', None)
        self.is_solved = kwargs.get('is_solved', False)
        self.solved_by_path = kwargs.get('solved_by_path', None)  # Path to the User document who solved the thread
        self.solved_at = kwargs.get('solved_at', None)
        self.is_pinned = kwargs.get('is_pinned', False)
        self.pinned_by_path = kwargs.get('pinned_by_path', None)  # Path to the User document who pinned the thread
        self.pinned_at = kwargs.get('pinned_at', None)

    def to_dict(self):
        """Converts the thread object to a dictionary suitable for Firestore."""
        return {
            "title": self.title,
            "forum_path": self.forum_path,
            "created_by_path": self.created_by_path,
            "created_at": self.created_at,
            "is_closed": self.is_closed,
            "closed_by_path": self.closed_by_path,
            "closed_at": self.closed_at,
            "is_solved": self.is_solved,
            "solved_by_path": self.solved_by_path,
            "solved_at": self.solved_at,
            "is_pinned": self.is_pinned,
            "pinned_by_path": self.pinned_by_path,
            "pinned_at": self.pinned_at,
        }

    @staticmethod
    def from_dict(data):
        """Creates a ThreadFirestore object from a dictionary."""
        return ThreadFirestore(**data)

    def save(self):
        """Saves the thread to Firestore, auto-generating an ID."""
        db.collection('threads').add(self.to_dict())

# Example usage
thread = ThreadFirestore(
    title="Example Thread",
    forum_path="forums/exampleForumID",
    created_by_path="users/exampleUserID"
)
thread.save()