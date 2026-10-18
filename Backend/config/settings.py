"""
Django settings for config project.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


# --- Sécurité ---------------------------------------------------------------

# Lue depuis le .env ; la valeur par défaut ne sert qu'en développement local
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-dev-only-change-me",
)

# DEBUG=True seulement en développement
DEBUG = os.environ.get("DEBUG", "True") == "True"

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]


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

# Frontend React (Vite) autorisé à appeler l'API
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
# Le frontend envoie le cookie de session avec ses requêtes
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

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

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "agri_db"),
        "USER": os.environ.get("DB_USER", "postgres"),
        "PASSWORD": os.environ.get("DB_PASSWORD", "postgres"),
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    }
}


# --- Django REST Framework --------------------------------------------------

REST_FRAMEWORK = {
    # Connexion par session Django (cookie), sans token pour le moment
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.SessionAuthentication",
    ),
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