from django.shortcuts import redirect

def api_root(request):
    """
    Redirects to the API documentation (Swagger UI, if you've set it up).
    """
    return redirect('/api/docs/')  # Replace with your actual API docs URL