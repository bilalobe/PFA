from rest_framework.decorators import api_view
from rest_framework.response import Response
from nltk.sentiment.vader import SentimentIntensityAnalyzer

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