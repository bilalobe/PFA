from textblob import TextBlob
from django.http import JsonResponse

def analyze_sentiment(request):
    if request.method == 'POST':
        text = request.POST.get('text')
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        sentiment = "neutral"
        if polarity > 0:
            sentiment = "positive"
        elif polarity < 0:
            sentiment = "negative"
        
        result = {
            'text': text,
            'sentiment': sentiment,
            'polarity': polarity,
            'subjectivity': subjectivity,
        }
        return JsonResponse(result)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
