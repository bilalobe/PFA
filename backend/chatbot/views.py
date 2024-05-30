import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions, status

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def chat(request):
    user_message = request.data.get('message')
    if user_message:
        response = requests.post(
            'http://localhost:5005/webhooks/rest/webhook',  # Rasa server URL
            json={'message': user_message}
        )
        if response.status_code == 200:
            return Response(response.json())
        else:
            return Response({'error': 'Error contacting chatbot'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response({'error': 'No message provided'}, status=status.HTTP_400_BAD_REQUEST)
