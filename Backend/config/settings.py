"""
Django settings for config project.
"""

import os
from pathlib import Path
from datetime import timedelta

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent


# --- Sécurité ---------------------------------------------------------------

# Lue depuis le .env ; la valeur par défaut ne sert qu'en développement local
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-dev-only-change-me",
)

# DEBUG=True seulement en développement
DEBUG = os.environ.get("DEBUG", "True") == "True"

# Domaines autorisés, séparés par des virgules (ex: "mon-app.onrender.com")
ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if h.strip()
]


# --- Applications -----------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # tiers
    "rest_framework",
    "corsheaders",
    # tes apps
    "utilisateurs",
    "agriculteur",
    "technicien",
    "notifications",
]

# Modèle utilisateur personnalisé
AUTH_USER_MODEL = "utilisateurs.User"


# --- Middleware -------------------------------------------------------------

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # doit être en premier
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# Frontend Next.js (port 3000) et React (port 5173) autorisés à appeler l'API
# Domaines supplémentaires autorisés (ex: frontend déployé), séparés par des virgules
_extra_origins = [
    o.strip()
    for o in os.environ.get("EXTRA_CORS_ORIGINS", "").split(",")
    if o.strip()
]
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
] + _extra_origins
# Le frontend envoie le cookie de session avec ses requêtes
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# Cookies sécurisés et HTTPS imposé en production (DEBUG=False)
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True

SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_HTTPONLY = True

# Session expire après 24 heures d'inactivité
SESSION_COOKIE_AGE = 86400          # 86400 secondes = 24 heures
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # Garde la session même si on ferme le navigateur (jusqu'aux 24h)
SESSION_SAVE_EVERY_REQUEST = True   # Renouvelle le délai à chaque requête (inactivité de 24h)

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# --- Base de données (PostgreSQL) -------------------------------------------

# DATABASE_URL (ex: Neon) si définie, sinon les variables DB_* (local / docker-compose)
DATABASES = {
    "default": dj_database_url.config(
        default=(
            f"postgres://{os.environ.get('DB_USER', 'postgres')}"
            f":{os.environ.get('DB_PASSWORD', 'postgres')}"
            f"@{os.environ.get('DB_HOST', 'localhost')}"
            f":{os.environ.get('DB_PORT', '5432')}"
            f"/{os.environ.get('DB_NAME', 'agri_db')}"
        ),
        conn_max_age=600,
    )
}


# --- Django REST Framework --------------------------------------------------


REST_FRAMEWORK = {
    # Connexion par session Django (cookie) avec gestion des requêtes API cross-origin
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "utilisateurs.authentication.CsrfExemptSessionAuthentication",
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
}


# --- Validation des mots de passe -------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# --- Internationalisation ---------------------------------------------------

LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Ouagadougou"
USE_I18N = True
USE_TZ = True


# --- Fichiers statiques -----------------------------------------------------

STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"