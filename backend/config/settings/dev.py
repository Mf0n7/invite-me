"""Configurações de desenvolvimento."""
from .base import *  # noqa: F403
from .base import INSTALLED_APPS, MIDDLEWARE, env

DEBUG = True

# E-mail no console em dev (já é o default do base, explícito aqui).
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# CORS liberado em dev para agilizar.
CORS_ALLOW_ALL_ORIGINS = True

# django-debug-toolbar (opcional, só se instalado e DEBUG).
if env.bool("ENABLE_DEBUG_TOOLBAR", default=False):
    INSTALLED_APPS += ["debug_toolbar"]
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")
    INTERNAL_IPS = ["127.0.0.1"]
