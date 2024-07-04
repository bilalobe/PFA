from rest_framework.decorators import api_view
from rest_framework.response import Response
from gensim.summarization import summarize

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