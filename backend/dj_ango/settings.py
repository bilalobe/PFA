import os
import dj_database_url
from pathlib import Path
from decouple import config
from datetime import timedelta
from azure.storage.blob import BlobServiceClient
import sentry_sdk  
from sentry_sdk.integrations.django import DjangoIntegration  

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Directory for locale files  
LOCALE_PATHS = [  
    os.path.join(BASE_DIR, 'locale'),  
] 

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')  
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)  

ALLOWED_HOSTS = ['your-deployment-hostname']

AZURE_STORAGE_CONNECTION_STRING = os.environ.get('AZURE_STORAGE_CONNECTION_STRING')
AZURE_STORAGE_ACCOUNT_NAME = os.environ.get('AZURE_STORAGE_ACCOUNT_NAME')
AZURE_STORAGE_CONTAINER_NAME = os.environ.get('AZURE_STORAGE_CONTAINER_NAME')
# ...

DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
STATICFILES_STORAGE = 'storages.backends.azure_storage.AzureStorage'
STATICFILES_LOCATION = 'static'

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'rest_framework_nested',
    'dj_rest_auth',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google', 
    'dj_rest_auth.registration',
    'chatbot', 
    'utilisateur',
    'cours',
    'module',
    'question',
    'quiz',
    'enrollment',
    'forum',
    'moderation'
    'resource',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware', 
    'django.middleware.locale.LocaleMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'dj_ango.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'dj_ango.wsgi.application'

# Database
DATABASES = {  
    'default': dj_database_url.config(default=config('DATABASE_URL'))  
}  

REST_FRAMEWORK = {
    # Authentication classes
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',  # Enable session authentication
        'rest_framework.authentication.BasicAuthentication',  # Enable basic authentication for testing
    ),

    # Permission classes
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),

    # Pagination
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,

    # Filter backends
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',  # Enable DjangoFilterBackend for filtering
        'rest_framework.filters.SearchFilter',  # Enable search filter
        'rest_framework.filters.OrderingFilter',  # Enable ordering filter
    ),

    # Throttling
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',  # Throttle for anonymous users
        'rest_framework.throttling.UserRateThrottle',  # Throttle for authenticated users
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',  # 100 requests per day for anonymous users
        'user': '1000/day',  # 1000 requests per day for authenticated users
    },

    # Exception handling
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',  # Default exception handler (optional)

    # Renderer and parser classes
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',  # Enable browsable API renderer
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',  # Enable multipart parser for file uploads
    ),
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'frontend' / 'build' / 'static',
]
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media/'

# CORS Configuration (Allow all origins for development)
CORS_ORIGIN_ALLOW_ALL = True

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

sentry_sdk.init(  
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",  
    integrations=[DjangoIntegration()],  
    traces_sample_rate=1.0,  
    send_default_pii=True  
)  

AUTHENTICATION_BACKENDS = [
    # ... other authentication backends ...
    'allauth.account.auth_backends.AuthenticationBackend', 
    # ...
]

SITE_ID = 1 # Set your site ID

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = 'your_google_client_id'  # Replace with your Google client ID
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = 'your_google_client_secret' # Replace with your Google client secret

SOCIAL_AUTH_URL_NAMESPACE = 'social'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # Or your email provider's SMTP server
EMAIL_PORT = 587  # Or the appropriate port for your provider
EMAIL_HOST_USER = 'your_email@gmail.com'  # Replace with your email address
EMAIL_HOST_PASSWORD = 'your_password'  # Replace with your email password
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'Your E-Learning Platform <your_email@gmail.com>'

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5), # Short lifespan for access tokens
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),  # Longer lifespan for refresh tokens
    'ROTATE_REFRESH_TOKENS': True,             # Rotate refresh tokens on each refresh request
    'BLACKLIST_AFTER_ROTATION': True,         # Blacklist old refresh tokens after rotation
    # ... other JWT settings as needed 
}