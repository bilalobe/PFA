from rest_framework.decorators import api_view
from rest_framework.response import Response
from textblob import TextBlob


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
        # Implement text summarization logic here
        summary = "This is a summary of the text."
        return Response({"summary": summary})
    else:
        return Response({"error": "No text provided."}, status=400)


@api_view(["POST"])
def generate_questions(request):
    text = request.data.get("text", "")
    if text:
        # Implement question generation logic here
        questions = ["What is the main idea?", "What are the key points?"]
        return Response({"questions": questions})
    else:
        return Response({"error": "No text provided."}, status=400)


@api_view(["POST"])
def sentiment_analysis(request):
    text = request.data.get("text", "")
    if text:
        sentiment = TextBlob(text).sentiment
        return Response({"sentiment": sentiment})
    else:
        return Response({"error": "No text provided."}, status=400)


@api_view(["POST"])
def detect_language(request):
    text = request.data.get("text", "")
    if text:
        language = TextBlob(text).detect_language()
        return Response({"language": language})
    else:
        return Response({"error": "No text provided."}, status=400)


@api_view(["POST"])
def translate_text(request):
    text = request.data.get("text", "")
    language = request.data.get("language", "")
    if text and language:
        translated_text = TextBlob(text).translate(to=language)
        return Response({"translated_text": translated_text})
    else:
        return Response({"error": "No text or language provided."}, status=400)
