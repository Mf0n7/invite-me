"""Configurações de produção (Coolify / Hostinger VPS)."""
from .base import *  # noqa: F403
from .base import env

DEBUG = False

# SMTP real em produção.
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

# Segurança — assume terminação TLS no proxy do Coolify (Traefik).
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True

CORS_ALLOW_ALL_ORIGINS = False
