"""Configurações de produção (Coolify / Hostinger VPS)."""
from .base import *  # noqa: F403
from .base import REDIS_URL, SPECTACULAR_SETTINGS, env

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


def _cache_url(url: str) -> str:
    """Mesma instância do Redis, banco 1 — separa do broker do Celery (banco 0)."""
    base, sep, tail = url.rpartition("/")
    if sep and tail.isdigit():
        return f"{base}/1"
    return url.rstrip("/") + "/1"


# Cache compartilhado entre os workers do gunicorn. É o que faz o rate limit
# contar de verdade: com LocMemCache cada worker teria a própria contagem e o
# teto efetivo seria N × o configurado.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": env("REDIS_CACHE_URL", default=_cache_url(REDIS_URL)),
        "KEY_PREFIX": "convida",
        "OPTIONS": {
            # Redis lento/fora do ar não pode segurar o worker: falha rápido e
            # o rate limit entra em fail-open (ver apps/common/ratelimit.py).
            "socket_connect_timeout": 1,
            "socket_timeout": 1,
            "retry_on_timeout": False,
        },
    }
}

# Documentação da API (Swagger/Redoc/schema): restrita a staff por padrão.
# Para reabrir ao público, defina API_DOCS_PUBLIC=true no painel do Coolify.
if not env.bool("API_DOCS_PUBLIC", default=False):
    SPECTACULAR_SETTINGS["SERVE_PERMISSIONS"] = [
        "rest_framework.permissions.IsAdminUser"
    ]
