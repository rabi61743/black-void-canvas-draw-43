# config/middleware.py
from django.conf import settings

class CustomXFrameOptionsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith(settings.MEDIA_URL):
            response['X-Frame-Options'] = 'SAMEORIGIN'
            print(f"Set X-Frame-Options: SAMEORIGIN for {request.path}")  # Debug
        else:
            response['X-Frame-Options'] = settings.X_FRAME_OPTIONS
        return response