import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
import environ

# Initialize django-environ
env = environ.Env()
environ.Env.read_env()

# Initialize Sentry
sentry_sdk.init(
    dsn=env("SENTRY_DSN"),
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True
)