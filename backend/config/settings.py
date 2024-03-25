import datetime
import os
from pathlib import Path
from django.core.files.storage import FileSystemStorage
from django.utils.log import DEFAULT_LOGGING
import environ

env = environ.Env(DEBUG=(bool, True))

BASE_DIR = Path(__file__).resolve().parent.parent

environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

DEBUG = env.bool('DEBUG')

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS') or []

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/django.log',
            'maxBytes': 1024*1024*5, # 5MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'django.server': DEFAULT_LOGGING['handlers']['django.server']
    },
    'formatters': {
        'verbose': {
            'format': '%(asctime)s %(levelname)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'django.server': DEFAULT_LOGGING['formatters']['django.server'],
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.server': DEFAULT_LOGGING['loggers']['django.server'],
    },
}

FILE_SYSTEM = FileSystemStorage(location='file_storage')

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        # 'rest_framework.authentication.SessionAuthentication',
        'authorize.authentication.TokenAuthentication'
    ),
    "EXCEPTION_HANDLER": ("utils.handlers.handle_exceptions")
}

DATABASES = {
    'default': {
        'ENGINE'  : env('DB_ENGINE') or 'django.db.backends.postgresql',
        'NAME'    : env('DB_NAME') or 'oblako',
        'USER'    : env('DB_USER') or 'student',
        'PASSWORD': env('DB_PASS') or 'student',
        'HOST'    : env('DB_HOST') or '127.0.0.1',
        'PORT'    : env.int('DB_PORT') or 5432,
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 6,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTH_USER_MODEL = "users.User"

SECRET_KEY = 'SECRET_KEY'

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME"   : datetime.timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME"  : datetime.timedelta(days=2),
    "ROTATE_REFRESH_TOKENS"   : False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN"       : False,

    "ALGORITHM"    : "HS256",
    "SIGNING_KEY"  : SECRET_KEY,
    "VERIFYING_KEY": "",
    "AUDIENCE"     : None,
    "ISSUER"       : None,
    "JSON_ENCODER" : None,
    "JWK_URL"      : None,
    "LEEWAY"       : 0,

    "AUTH_HEADER_TYPES"       : ("Bearer",),
    "AUTH_HEADER_NAME"        : "HTTP_AUTHORIZATION",
    "USER_ID_FIELD"           : "id",
    "USER_ID_CLAIM"           : "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",

    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM"  : "token_type",
    "TOKEN_USER_CLASS"  : "rest_framework_simplejwt.models.TokenUser",

    "JTI_CLAIM": "jti",

    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME"         : datetime.timedelta(days=1),
    "SLIDING_TOKEN_REFRESH_LIFETIME" : datetime.timedelta(days=2),

    "TOKEN_OBTAIN_SERIALIZER"         : "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER"        : "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
    "TOKEN_VERIFY_SERIALIZER"         : "rest_framework_simplejwt.serializers.TokenVerifySerializer",
    "TOKEN_BLACKLIST_SERIALIZER"      : "rest_framework_simplejwt.serializers.TokenBlacklistSerializer",
    "SLIDING_TOKEN_OBTAIN_SERIALIZER" : "rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer",
    "SLIDING_TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer",
}