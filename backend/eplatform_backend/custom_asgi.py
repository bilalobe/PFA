import os
from django.core.asgi import get_asgi_application
from sentry_sdk.integrations.asgi import SentryAsgiMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eplatform_backend.settings')

django_asgi_app = get_asgi_application()
application = SentryAsgiMiddleware(django_asgi_app)