from firebase_admin import firestore
from datetime import datetime
from common.firebase_admin_init import db
from typing import Dict, Any
from common.exceptions import CustomException, custom_exception_handler

db = firestore.client()

class PostService:
    def __init__(self, user_email):
        self.user_email = user_email

    async def create_post(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Asynchronously creates a post with the given validated data in Firestore.

        :param validated_data: A dictionary containing the post data to be validated and stored.
        :return: A dictionary representing the created post.
        :raises: CustomException for specific error scenarios.
        """
        try:
            post_data = validated_data.copy()
            post_data['author'] = self.user_email
            post_data['created_at'] = datetime.now()
            post_data['updated_at'] = datetime.now()

            # Correctly handle Firestore add operation which is not awaitable
            post_ref = db.collection('posts').add(post_data)
            # Firestore's add operation returns a DocumentReference, so we need to wait for the write operation to complete
            # and then get the document. This part of the code is not designed to be used with asyncio directly.
            # If you need to use it in an async context, consider using a different approach or library that supports asyncio.
            post_doc = post_ref[1].get()  # post_ref is a tuple (WriteResult, DocumentReference)
            return post_doc.to_dict()
        except Exception as e:
            # Correctly raise an exception
            error_message = f"Failed to create post: {str(e)}"
            raise CustomException(error_message, context="create_post") from e
        
    def post_creation_actions(self, post_ref):
        """
        Performs additional actions after a post is created, such as sending notifications.
        """
        # Fetch the post to get its title
        post_doc = post_ref.get()
        if post_doc.exists:
            print(f"Post '{post_doc.to_dict()['title']}' created by {self.user_email}")
        else:
            print("Post creation failed or post not found.")

def get_post_content(post_id):
    """
    Fetches the content of a post by its ID from Firestore.
    """
    post_ref = db.collection('posts').document(post_id)
    post_doc = post_ref.get()
    if post_doc.exists:
        post_data = post_doc.to_dict()
        if post_data is not None and 'content' in post_data:
            return post_data['content']
        else:
            raise Exception(f"Post with id {post_id} does not have content.")
    else:
        raise Exception(f"Post with id {post_id} not found.")