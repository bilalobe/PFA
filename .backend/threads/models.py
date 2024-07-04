from google.cloud.firestore import SERVER_TIMESTAMP
from common.firebase_admin_init import db

class Thread:
    """
    Represents a thread in Firestore.

    Attributes:
        id (str): The Firestore document ID.
        title (str): The title of the thread.
        forum_path (str): The path of the forum where the thread belongs.
        created_by_path (str): The path of the user who created the thread.
        created_at (datetime): The timestamp when the thread was created.
        is_closed (bool): Indicates whether the thread is closed or not.
        closed_by_path (str): The path of the user who closed the thread.
        closed_at (datetime): The timestamp when the thread was closed.
        is_solved (bool): Indicates whether the thread is solved or not.
        solved_by_path (str): The path of the user who solved the thread.
        solved_at (datetime): The timestamp when the thread was solved.
        is_pinned (bool): Indicates whether the thread is pinned or not.
        pinned_by_path (str): The path of the user who pinned the thread.
        pinned_at (datetime): The timestamp when the thread was pinned.
    """

    def __init__(self, title, forum_path, created_by_path, id=None, **kwargs):
        self.id = id  # Firestore document ID
        self.title = title
        self.forum_path = forum_path
        self.created_by_path = created_by_path
        self.created_at = kwargs.get('created_at', SERVER_TIMESTAMP)
        self.is_closed = kwargs.get('is_closed', False)
        self.closed_by_path = kwargs.get('closed_by_path', None)
        self.closed_at = kwargs.get('closed_at', None)
        self.is_solved = kwargs.get('is_solved', False)
        self.solved_by_path = kwargs.get('solved_by_path', None)
        self.solved_at = kwargs.get('solved_at', None)
        self.is_pinned = kwargs.get('is_pinned', False)
        self.pinned_by_path = kwargs.get('pinned_by_path', None)
        self.pinned_at = kwargs.get('pinned_at', None)

    def to_dict(self):
        """
        Converts the ThreadFirestore object to a dictionary.

        Returns:
            dict: A dictionary representation of the ThreadFirestore object.
        """
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
    def from_dict(data, doc_id=None):
        """
        Creates a ThreadFirestore object from a dictionary.

        Args:
            data (dict): The dictionary containing the thread data.
            doc_id (str, optional): The document ID. Defaults to None.

        Returns:
            ThreadFirestore: The ThreadFirestore object.
        """
        if doc_id:
            data['id'] = doc_id
        return Thread(**data)

    def save(self):
        """
        Saves the ThreadFirestore object to Firestore.

        If the object doesn't have an ID, it will be added as a new document.
        Otherwise, it will be updated in the Firestore collection.
        """
        if not self.id:
            doc_ref = db.collection('threads').add(self.to_dict())[1]
            self.id = doc_ref.id
        else:
            self.update(self.id)

    def update(self, thread_id):
        """
        Updates the ThreadFirestore object in Firestore.

        Args:
            thread_id (str): The ID of the thread document in Firestore.
        """
        db.collection('threads').document(thread_id).update(self.to_dict())

    def delete(self):
        """
        Deletes the ThreadFirestore object from Firestore.

        If the object has an ID, it will be deleted from the Firestore collection.
        """
        if self.id:
            db.collection('threads').document(self.id).delete()

    @staticmethod
    def get(thread_id):
        """
        Retrieves a ThreadFirestore object from Firestore.

        Args:
            thread_id (str): The ID of the thread document in Firestore.

        Returns:
            ThreadFirestore: The ThreadFirestore object if found, None otherwise.
        """
        doc = db.collection('threads').document(thread_id).get()
        if doc.exists:
            return Thread.from_dict(doc.to_dict(), doc_id=thread_id)
        return None

    @staticmethod
    def get_all(limit=None, order_by=None):
        """
        Retrieves all ThreadFirestore objects from Firestore.

        Args:
            limit (int, optional): The maximum number of threads to retrieve. Defaults to None.
            order_by (str, optional): The field to order the threads by. Defaults to None.

        Returns:
            list: A list of ThreadFirestore objects.
        """
        query = db.collection('threads')
        if order_by:
            query = query.order_by(order_by)
        if limit:
            query = query.limit(limit)
        threads = query.stream()
        return [Thread.from_dict(thread.to_dict(), doc_id=thread.id) for thread in threads]


class Tag:
    """
    Represents a tag in Firestore.

    Attributes:
        id (str): The Firestore document ID.
        name (str): The name of the tag.
        description (str): A brief description of the tag.
        created_at (datetime): The timestamp when the tag was created.
    """

    def __init__(self, name, description, id=None, created_at=SERVER_TIMESTAMP):
        self.id = id  # Firestore document ID
        self.name = name
        self.description = description
        self.created_at = created_at

    def to_dict(self):
        """
        Converts the Tag object to a dictionary.

        Returns:
            dict: A dictionary representation of the Tag object.
        """
        return {
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at,
        }

    @staticmethod
    def from_dict(data, doc_id=None):
        """
        Creates a Tag object from a dictionary.

        Args:
            data (dict): The dictionary containing the tag data.
            doc_id (str, optional): The document ID. Defaults to None.

        Returns:
            Tag: The Tag object.
        """
        if doc_id:
            data['id'] = doc_id
        return Tag(**data)

    def save(self):
        """
        Saves the Tag object to Firestore.

        If the object doesn't have an ID, it will be added as a new document.
        Otherwise, it will update the existing document in the Firestore collection.
        """
        if not self.id:
            doc_ref = db.collection('tags').add(self.to_dict())[1]
            self.id = doc_ref.id
        else:
            db.collection('tags').document(self.id).update(self.to_dict())

    def delete(self):
        """
        Deletes the Tag object from Firestore.

        If the object has an ID, it will be deleted from the Firestore collection.
        """
        if self.id:
            db.collection('tags').document(self.id).delete()

    @staticmethod
    def get(tag_id):
        """
        Retrieves a Tag object from Firestore.

        Args:
            tag_id (str): The ID of the tag document in Firestore.

        Returns:
            Tag: The Tag object if found, None otherwise.
        """
        doc = db.collection('tags').document(tag_id).get()
        if doc.exists:
            return Tag.from_dict(doc.to_dict(), doc_id=tag_id)
        return None

    @staticmethod
    def get_all(limit=None, order_by=None):
        """
        Retrieves all Tag objects from Firestore.

        Args:
            limit (int, optional): The maximum number of tags to retrieve. Defaults to None.
            order_by (str, optional): The field to order the tags by. Defaults to None.

        Returns:
            list: A list of Tag objects.
        """
        query = db.collection('tags')
        if order_by:
            query = query.order_by(order_by)
        if limit:
            query = query.limit(limit)
        tags = query.stream()
        return [Tag.from_dict(tag.to_dict(), doc_id=tag.id) for tag in tags]
