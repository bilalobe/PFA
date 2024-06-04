# Ensure that these imports match your project structure
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import logging

from textblob import TextBlob

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analyze_sentiment(request):
    """
    Analyzes the sentiment of the provided text.

    Requires authentication.
    """
    text = request.data.get('text')
    if text:
        analysis = TextBlob(text) 
        sentiment = analysis.sentiment.polarity
        if sentiment > 0:
            sentiment_label = 'positive'
        elif sentiment < 0:
            sentiment_label = 'negative'
        else:
            sentiment_label = 'neutral'
        return Response({'sentiment': sentiment_label, 'score': sentiment})
    else:
        return Response({'error': 'Missing text input.'}, status=400)
