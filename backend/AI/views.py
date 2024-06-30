from rest_framework.decorators import api_view
from rest_framework.response import Response
from textblob import TextBlob
from textblob.exceptions import NotTranslated
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from rest_framework.decorators import api_view
from gensim.summarization import summarize # type: ignore


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


@api_view(["POST"])
def summarize_text(request):
    """
    Summarizes the provided text.

    Args:
        request (Request): The HTTP request object containing "text" as a key in its data.

    Returns:
        Response: The HTTP response object containing the summary of the text or an error message.
    """
    text = request.data.get("text", "")
    if text:
        try:
            summary = summarize(text)
            if not summary:
                summary = "Summary could not be generated, text may be too short."
            return Response({"summary": summary})
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
    else:
        return Response({"error": "No text provided."}, status=400)

@api_view(["POST"])
def sentiment_analysis(request):
    """
    Analyzes the sentiment of the provided text.

    Args:
        request (Request): The HTTP request object containing "text" as a key in its data.

    Returns:
        Response: The HTTP response object containing the sentiment analysis results or an error message.
    """
    text = request.data.get("text", "")
    if text:
        analyzer = SentimentIntensityAnalyzer()
        sentiment = analyzer.polarity_scores(text)
        return Response({
            "sentiment": {
                "polarity": sentiment["compound"],
                "subjectivity": sentiment["pos"] - sentiment["neg"]
            }
        })
    else:
        return Response({"error": "No text provided."}, status=400)

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


@api_view(["POST"])
def translate_text(request):
    """
    Translates the given text to the specified language.

    Args:
        request (Request): The HTTP request object containing "text" and "language" as keys in its data.

    Returns:
        Response: The HTTP response object containing the translated text or an error message.

    Raises:
        NotTranslated: If the text cannot be translated.
        Exception: If an error occurs during translation.

    Example:
        >>> data = {
        ...     "text": "Hello",
        ...     "language": "es"
        ... }
        >>> response = translate_text(data)
        >>> print(response)
        {
            "translated_text": "Hola"
        }

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
