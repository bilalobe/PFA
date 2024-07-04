from rest_framework.decorators import api_view
from rest_framework.response import Response    
from textblob import TextBlob

@api_view(["POST"])
def correct_text(request):
    """
    Corrects the spelling in the provided text.

    Args:
        request (Request): The HTTP request object containing "text" as a key in its data.

    Returns:
        Response: The HTTP response object containing the corrected text or an error message.
    """
    text = request.data.get("text", "")
    if text:
        corrected_text = str(TextBlob(text).correct())
        return Response({"corrected_text": corrected_text})
    else:
        return Response({"error": "No text provided."}, status=400)