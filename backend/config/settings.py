import os
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-insecure-key")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
if not DEBUG and SECRET_KEY == "dev-only-insecure-key":
    raise RuntimeError("Set DJANGO_SECRET_KEY in production")
REOPEN_WINDOW_DAYS = int(os.environ.get("REOPEN_WINDOW_DAYS", "7"))
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1,testserver").split(",")
INSTALLED_APPS = ["django.contrib.admin","django.contrib.auth","django.contrib.contenttypes",
    "django.contrib.sessions","django.contrib.messages","django.contrib.staticfiles","rest_framework","drf_spectacular","drf_spectacular_sidecar","grievance"]
MIDDLEWARE = ["django.middleware.security.SecurityMiddleware","whitenoise.middleware.WhiteNoiseMiddleware","django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware","django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware","django.contrib.messages.middleware.MessageMiddleware"]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{"BACKEND":"django.template.backends.django.DjangoTemplates","APP_DIRS":True,
    "OPTIONS":{"context_processors":["django.template.context_processors.request",
    "django.contrib.auth.context_processors.auth","django.contrib.messages.context_processors.messages"]}}]
AUTH_USER_MODEL = "grievance.User"
if os.environ.get("POSTGRES_DB"):
    DATABASES = {"default":{"ENGINE":"django.db.backends.postgresql","NAME":os.environ["POSTGRES_DB"],
        "USER":os.environ.get("POSTGRES_USER",""),"PASSWORD":os.environ.get("POSTGRES_PASSWORD",""),
        "HOST":os.environ.get("POSTGRES_HOST","localhost")}}
else:
    DATABASES = {"default":{"ENGINE":"django.db.backends.sqlite3","NAME":BASE_DIR/"db.sqlite3"}}
AUTH_PASSWORD_VALIDATORS = [{"NAME":"django.contrib.auth.password_validation.MinimumLengthValidator"}]
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework_simplejwt.authentication.JWTAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination", "PAGE_SIZE": 20,
    "DEFAULT_THROTTLE_RATES": {"track": "10/min", "public_submit": "5/hour", "register": "10/hour"},
}
SPECTACULAR_SETTINGS = {
    "TITLE": "Campus Grievance API", "VERSION": "1.0.0", "SERVE_INCLUDE_SCHEMA": False,
    "SWAGGER_UI_DIST": "SIDECAR", "SWAGGER_UI_FAVICON_HREF": "SIDECAR", "REDOC_DIST": "SIDECAR",
    "COMPONENT_SPLIT_REQUEST": True,
}
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'