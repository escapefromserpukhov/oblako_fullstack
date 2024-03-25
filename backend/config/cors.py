from corsheaders.defaults import default_headers, default_methods
import environ

env = environ.Env(DEBUG=(bool, True))

CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS') or ['http://localhost:5173']

CORS_ALLOW_METHODS = (
    *default_methods,
)

CORS_ALLOW_HEADERS = (
    *default_headers,
    "accept",
    "authorization",
    "credentials",
    "content-type",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
)

CORS_URLS_REGEX = r"^/api/.*$"