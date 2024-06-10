"""
Django settings module for the E-Learning Platform.

This module contains the configuration settings for the E-Learning Platform Django project.
It includes settings for database, static files, media files, authentication, caching, email, API, and more.

For more information on Django settings, refer to the Django documentation:
https://docs.djangoproject.com/en/3.2/topics/settings/

For more information on the E-Learning Platform, visit:
https://example.com/e-learning-platform

Author: bebo
Date: YYYY-MM-DD
"""
import os
from pathlib import Path
from datetime import timedelta

from decouple import config
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

BASE_DIR = Path(__file__).resolve().parent.parent

LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)

# Ensure ALLOWED_HOSTS is always treated as a string
allowed_hosts = config('ALLOWED_HOSTS', default='localhost')
if isinstance(allowed_hosts, str):
    ALLOWED_HOSTS = allowed_hosts.split(',')
else:
    ALLOWED_HOSTS = ['localhost']

AZURE_STORAGE_CONNECTION_STRING = config('AZURE_STORAGE_CONNECTION_STRING')
AZURE_STORAGE_ACCOUNT_NAME = config('AZURE_STORAGE_ACCOUNT_NAME')
AZURE_STORAGE_CONTAINER_NAME = config('AZURE_STORAGE_CONTAINER_NAME')

DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
STATICFILES_STORAGE = 'storages.backends.azure_storage.AzureStorage'
STATICFILES_LOCATION = 'static'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',  # Filtering
    'django_extensions',  # Additional commands
    'django_redis',  # Redis cache
    'corsheaders',  # Cross-Origin Resource Sharing
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'rest_framework_nested',
    'dj_rest_auth',
    'channels',  # Websockets
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'dj_rest_auth.registration',
    'drf_spectacular',  # API documentation
    'chatbot',
    'user',
    'course',
    'module',
    'question',
    'profile',
    'quiz',
    'enrollment',
    'forum',
    'moderation',
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

ASGI_APPLICATION = 'dj_ango.asgi.application' # Your ASGI application

# Channel Layers Configuration (using Redis) 
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)], # Update with your Redis connection
        },
    },
}

# Ensure DATABASE_URL default value is a string
REST_FRAMEWORK = {  
    'DEFAULT_AUTHENTICATION_CLASSES': (  
        'rest_framework_simplejwt.authentication.JWTAuthentication',  
        'rest_framework.authentication.SessionAuthentication',  
        'rest_framework.authentication.BasicAuthentication',  
    ),  
    'DEFAULT_PERMISSION_CLASSES': (  
        'rest_framework.permissions.IsAuthenticated',  
    ),  
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',  
    'PAGE_SIZE': 10,  
    'DEFAULT_FILTER_BACKENDS': (  
        'django_filters.rest_framework.DjangoFilterBackend',  
        'rest_framework.filters.SearchFilter',  
        'rest_framework.filters.OrderingFilter',  
    ),  
    'DEFAULT_THROTTLE_CLASSES': (  
        'rest_framework.throttling.AnonRateThrottle',  
        'rest_framework.throttling.UserRateThrottle',  
    ),  
    'DEFAULT_THROTTLE_RATES': {  
        'anon': '100/day',  
        'user': '1000/day',  
    },    
    'DEFAULT_RENDERER_CLASSES': [  
        'rest_framework.renderers.JSONRenderer',  
        'rest_framework.renderers.BrowsableAPIRenderer',  
    ],  
    'DEFAULT_PARSER_CLASSES': [  
        'rest_framework.parsers.JSONParser',  
        'rest_framework.parsers.FormParser',  
        'rest_framework.parsers.MultiPartParser',  
    ],  
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',  
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',  
    'EXCEPTION_HANDLER': 'dj_ango.exceptions.custom_exception_handler',  # Set custom exception handler  
    'NON_FIELD_ERRORS_KEY': 'error',  
    'COERCE_DECIMAL_TO_STRING': False,  
} 

# CACHES setting
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',  # Replace with your Redis connection string
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

CACHE_MIDDLEWARE_KEY_PREFIX = 'eplatform'


SPECTACULAR_SETTINGS = {
    'TITLE': 'Your E-Learning Platform API',
    'DESCRIPTION': 'API documentation for your e-learning platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'displayOperationId': True,
    },
    'COMPONENT_SPLIT_REQUEST': True,
    'SWAGGER_UI_DIST_PATH': None,
}

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

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'frontend' / 'build' / 'static',
]
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media/'

CORS_ORIGIN_ALLOW_ALL = True

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

# Ensure SENTRY_DSN is a string
sentry_dsn = config('SENTRY_DSN', default='')
if isinstance(sentry_dsn, str):
    sentry_sdk.init(
        dsn=sentry_dsn,
        integrations=[DjangoIntegration()],
        traces_sample_rate=1.0,
        send_default_pii=True
    )

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend', 
]

SITE_ID = 1 

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = config('SOCIAL_AUTH_GOOGLE_OAUTH2_KEY')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = config('SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET')

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT', cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = config('EMAIL_USE_TLS', cast=bool)
DEFAULT_FROM_EMAIL = 'Your E-Learning Platform <noreply@example.com>'

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
}
