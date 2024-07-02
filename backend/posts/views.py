import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from backend.common.AppService.PostService import PostService, get_post_content
from posts.serializers import PostSerializer
from backend.common.services.TranslationService import TranslationService
from common.exceptions import PostNotFoundException

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post_service = PostService(self.request.user)
        try:
            post = post_service.create_post(serializer.validated_data)
            # Fixed by removing the second argument as it was not expected by post_creation_actions
            post_service.post_creation_actions(post)
        except PermissionDenied as e:
            raise e
        except Exception as e:
            logging.error(f"Failed to create post: {str(e)}")

@api_view(["GET"])
def translate_post(request, pk=None):
    """
    Translate a post to the specified target language.

    Args:
        request (Request): The HTTP request object.
        pk (int): The ID of the post to be translated.

    Returns:
        Response: The translated content in the specified target language.

    Raises:
        PostNotFoundException: If the post with the given ID is not found.
        Exception: If an error occurs during translation.
    """
    if pk is None:
        return Response({"error": "Post ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        post_content = get_post_content(pk)  # Retrieve the content of the post using its ID
        target_language = request.query_params.get("to", "en")  # Get the target language from query parameters, default to English
        translation_service = TranslationService(source_text=post_content, translated_text=None, source_language=None, target_language=target_language)
        translated_content = translation_service.translate() # type: ignore
        return Response({"translation": translated_content})  # Return the translated content
    except PostNotFoundException:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)  # Post not found
    except Exception as e:
        logging.error(f"Error translating post: {str(e)}")  # Log any other exceptions
        return Response({"error": "An error occurred during translation."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
def search_post(request, pk=None):
    """
    Retrieve the content of a post based on its ID.

    Args:
        request (HttpRequest): The HTTP request object.
        pk (int): The ID of the post to retrieve.

    Returns:
        Response: The response containing the post content or an error message.

    Raises:
        PostNotFoundException: If the post with the given ID is not found.
        Exception: If an error occurs while fetching the post.

    """
    if pk is None:
        return Response({"error": "Post ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        post_content = get_post_content(pk)
        return Response({"content": post_content})
    except PostNotFoundException:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logging.error(f"Error fetching post: {str(e)}")
        return Response({"error": "An error occurred while fetching the post."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)