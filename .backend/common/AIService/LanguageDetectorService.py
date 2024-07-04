from rest_framework.decorators import api_view
from rest_framework.response import Response
from textblob import TextBlob

@api_view(["POST"])
def detect_language(request):
    """
    Detects the language of the provided text.

    Args:
        request (Request): The HTTP request object containing "text" as a key in its data.

    Returns:
        Response: The HTTP response object containing the detected language or an error message.
    """
    text = request.data.get("text", "")
    if text:
        try:
            language = TextBlob(text).detect_language()
            return Response({"language": language})
        except Exception as e:
            return Response({"error": str(e)}, status=400)
    else:
        return Response({"error": "No text provided."}, status=400)
