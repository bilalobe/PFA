from fastapi import Request
from rest_framework.decorators import api_view
from rest_framework.response import Response
from textblob import TextBlob
from textblob.exceptions import NotTranslated
from rest_framework.response import Response


@api_view(["POST"])
def correct_text(request):
    text = request.data.get("text", "")
    if text:
        corrected_text = str(TextBlob(text).correct())
        return Response({"corrected_text": corrected_text})
    else:
        return Response({"error": "No text provided."}, status=400)

@api_view(["POST"])
def summarize_text(request):
    text = request.data.get("text", "")
    if text:
        # Placeholder: Implement text summarization logic here
        summary = "This is a summary of the text."
        return Response({"summary": summary})
    else:
        return Response({"error": "No text provided."}, status=400)

'''
@api_view(["POST"])
def sentiment_analysis(request: Request) -> Response:
    text: str = request.get("text", "")
    if text:
        blob: TextBlob = TextBlob(text)
        sentiment = blob.sentiment
        sentiment_polarity: float = sentiment.polarity
        sentiment_subjectivity: float = sentiment.subjectivity
        return Response({
            "sentiment": {
                "polarity": sentiment_polarity, 
                "subjectivity": sentiment_subjectivity
            }
        })
    else:
        return Response({"error": "No text provided."}, status=400)
'''

@api_view(["POST"])
def detect_language(request):
    text = request.data.get("text", "")
    if text:
        try:
            language = TextBlob(text).detect_language()
            return Response({"language": language})
        except Exception as e:
            return Response({"error": str(e)}, status=400)
    else:
        return Response({"error": "No text provided."}, status=400)

@api_view(["POST"])
def translate_text(request):
    """
    Translate the given text to the specified language.

    Args:
        request (Request): The HTTP request object.

    Returns:
        Response: The HTTP response object containing the translated text or an error message.

    Raises:
        NotTranslated: If the text cannot be translated.
        Exception: If an error occurs during translation.

    """
    text = request.data.get("text", "")
    language = request.data.get("language", "")
    if text and language:
        try:
            translated_text = str(TextBlob(text).translate(to=language))
            return Response({"translated_text": translated_text})
        except NotTranslated as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            return Response({"error": "Translation failed: " + str(e)}, status=400)
    else:
        return Response({"error": "No text or language provided."}, status=400)
