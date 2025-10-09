"""Production settings."""

import os
from datetime import timedelta

from .base import *  # noqa: F403,F401

DEBUG = os.getenv('DEBUG', 'False') == 'True'

SECRET_KEY = os.environ['DJANGO_SECRET_KEY']

ALLOWED_HOSTS = [host.strip() for host in os.getenv('ALLOWED_HOSTS', '').split(',') if host.strip()]

DATABASES = {  # noqa: F405
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ['POSTGRES_DB'],
        'USER': os.environ['POSTGRES_USER'],
        'PASSWORD': os.environ['POSTGRES_PASSWORD'],
        'HOST': os.getenv('POSTGRES_HOST', 'postgres'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
        'CONN_MAX_AGE': int(os.getenv('POSTGRES_CONN_MAX_AGE', '600')),
    }
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://redis:6379/1'),
    }
}

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'

CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',') if origin.strip()]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '31536000'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv('SECURE_HSTS_INCLUDE_SUBDOMAINS', 'True') == 'True'
SECURE_HSTS_PRELOAD = os.getenv('SECURE_HSTS_PRELOAD', 'True') == 'True'

SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'True') == 'True'
CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'True') == 'True'

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'  # noqa: F405

# WhiteNoise for static files
if 'whitenoise.middleware.WhiteNoiseMiddleware' not in MIDDLEWARE:  # type: ignore # noqa: F405
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')  # type: ignore # noqa: F405

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = [  # type: ignore # noqa: F405
    'rest_framework_simplejwt.authentication.JWTAuthentication',
]

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_MINUTES', '30'))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_DAYS', '1'))),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
}

