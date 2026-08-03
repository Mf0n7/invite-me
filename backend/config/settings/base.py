"""Configurações base do Convida. Compartilhadas por dev e prod."""
from datetime import timedelta
from pathlib import Path

import environ

# backend/config/settings/base.py -> backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DJANGO_DEBUG=(bool, False),
)
# Lê backend/.env se existir (não falha se ausente).
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-insecure-change-me")
DEBUG = env("DJANGO_DEBUG")
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:3000")

# Quantos proxies reversos confiáveis existem à frente da aplicação.
# No Coolify/Hostinger é 1 (Traefik). Se puser um CDN/WAF na frente, vire 2.
TRUSTED_PROXY_COUNT = env.int("TRUSTED_PROXY_COUNT", default=1)

# ---------------------------------------------------------------- Apps
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",
    "corsheaders",
    "drf_spectacular",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "dj_rest_auth",
    "dj_rest_auth.registration",
]

LOCAL_APPS = [
    "apps.accounts",
    "apps.events",
    "apps.invitations",
    "apps.rsvps",
    "apps.gifts",
    "apps.billing",
    "apps.administration",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ---------------------------------------------------------------- Middleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    # Logo após o CORS: descarta flood antes de qualquer trabalho da aplicação,
    # mas ainda dentro do CorsMiddleware para que o 429 leve os headers de CORS
    # (senão o browser mostra "erro de CORS" em vez do 429 real).
    "apps.common.middleware.IpRateLimitMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

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

# ---------------------------------------------------------------- Banco
DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
    ),
}

# ---------------------------------------------------------------- Auth
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

SITE_ID = 1

ACCOUNT_ADAPTER = "apps.accounts.adapters.AccountAdapter"
SOCIALACCOUNT_ADAPTER = "apps.accounts.adapters.SocialAccountAdapter"

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

# allauth — login por e-mail, sem username
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_USER_MODEL_EMAIL_FIELD = "email"
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
ACCOUNT_EMAIL_VERIFICATION = "optional"
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_EMAIL_SUBJECT_PREFIX = ""
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"access_type": "online"},
        "APP": {
            "client_id": env("GOOGLE_OAUTH_CLIENT_ID", default=""),
            "secret": env("GOOGLE_OAUTH_CLIENT_SECRET", default=""),
            "key": "",
        },
    }
}

# ---------------------------------------------------------------- DRF
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 25,
    # Resolve o IP real a partir do X-Forwarded-For contando da direita
    # (mesma lógica de apps.common.ratelimit.client_ip).
    "NUM_PROXIES": TRUSTED_PROXY_COUNT,
    "DEFAULT_THROTTLE_CLASSES": (
        "apps.common.throttling.BurstAnonThrottle",
        "apps.common.throttling.SustainedAnonThrottle",
        "apps.common.throttling.BurstUserThrottle",
        "apps.common.throttling.SustainedUserThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        # Padrões (valem para toda view que não declare escopo próprio)
        "anon_burst": env("THROTTLE_ANON_BURST", default="90/min"),
        "anon_sustained": env("THROTTLE_ANON_SUSTAINED", default="1200/hour"),
        "user_burst": env("THROTTLE_USER_BURST", default="180/min"),
        "user_sustained": env("THROTTLE_USER_SUSTAINED", default="4000/hour"),
        # Autenticação
        "login_ip": env("THROTTLE_LOGIN_IP", default="30/min"),
        "register": "5/min",
        "register_sustained": "20/hour",
        "password_reset": "5/min",
        "password_reset_sustained": "15/hour",
        "token_refresh": "60/min",
        # Rotas públicas (convite / RSVP / presentes)
        "public_read": env("THROTTLE_PUBLIC_READ", default="120/min"),
        "public_read_sustained": env("THROTTLE_PUBLIC_READ_HOUR", default="1200/hour"),
        "public_write": env("THROTTLE_PUBLIC_WRITE", default="12/min"),
        "public_write_sustained": env("THROTTLE_PUBLIC_WRITE_HOUR", default="60/hour"),
        # Ações caras do usuário autenticado
        "checkout": "20/min",
        "upload": "40/hour",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": True,
}

REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_HTTPONLY": False,
    "SESSION_LOGIN": False,
    "USER_DETAILS_SERIALIZER": "apps.accounts.serializers.UserSerializer",
    "REGISTER_SERIALIZER": "apps.accounts.serializers.CustomRegisterSerializer",
    "PASSWORD_RESET_SERIALIZER": "apps.accounts.serializers.CustomPasswordResetSerializer",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Convida API",
    "DESCRIPTION": "API de eventos, convites e RSVP do Convida.",
    "VERSION": "0.1.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    # Em prod a doc fica restrita a staff (prod.py sobrescreve). Deixar o schema
    # aberto entrega o mapa completo da API para quem quiser automatizar ataque.
    "SERVE_PERMISSIONS": ["rest_framework.permissions.AllowAny"],
    # Ordem e descrição dos grupos exibidos na doc (Swagger/Redoc).
    "TAGS": [
        {"name": "Conta & Autenticação", "description": "Cadastro, login (e-mail e Google) e tokens."},
        {"name": "Eventos", "description": "CRUD de eventos e link público de convite."},
        {"name": "Convites nominais", "description": "Convites individuais por pessoa e importação de listas."},
        {"name": "Confirmações (RSVP)", "description": "Confirmação de presença e resumo para o dono."},
        {"name": "Lista de presentes", "description": "Presentes do evento e reservas pelos convidados."},
        {"name": "Pagamentos & Assinatura", "description": "Faixas, checkouts, assinatura e webhook do Stripe."},
        {
            "name": "Administração",
            "description": "Painel de superusuário/staff — agregações de "
            "faturamento, usuários e visão geral (is_staff).",
        },
    ],
}

# ---------------------------------------------------------------- CORS / CSRF
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=["http://localhost:3000"])
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=["http://localhost:3000"])

# ---------------------------------------------------------------- Cache
# Em dev, cache local em memória (não exige Redis rodando).
# Em prod, prod.py troca por Redis — obrigatório para o rate limit valer
# entre os workers do gunicorn (senão cada worker conta sozinho).
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "convida-local",
    }
}

# ---------------------------------------------------------------- Rate limit / anti-DDoS
# Tetos por IP aplicados no middleware, antes de qualquer view.
RATE_LIMIT = {
    "ENABLED": env.bool("RATE_LIMIT_ENABLED", default=True),
    # Pico curto — navegação rápida entre páginas dispara várias chamadas.
    "BURST": env.int("RATE_LIMIT_BURST", default=60),
    "BURST_WINDOW": env.int("RATE_LIMIT_BURST_WINDOW", default=10),
    # Volume sustentado.
    "PER_MINUTE": env.int("RATE_LIMIT_PER_MINUTE", default=300),
    "PER_HOUR": env.int("RATE_LIMIT_PER_HOUR", default=4000),
    # Rotas sensíveis (autenticação e admin) — teto próprio, somado ao global.
    "SENSITIVE_PER_MINUTE": env.int("RATE_LIMIT_AUTH_PER_MINUTE", default=30),
    "SENSITIVE_PER_HOUR": env.int("RATE_LIMIT_AUTH_PER_HOUR", default=200),
    # Requisições simultâneas do mesmo IP.
    "MAX_CONCURRENT": env.int("RATE_LIMIT_MAX_CONCURRENT", default=15),
    "CONCURRENCY_TTL": 60,
    "EXEMPT_PREFIXES": [
        "/healthz/",
        "/api/v1/billing/webhook/",  # autenticado por assinatura HMAC do Stripe
    ],
    # Só os endpoints que manipulam credenciais. `/api/v1/auth/user/` e
    # `/logout/` ficam de fora de propósito: são chamados no fluxo normal e um
    # escritório inteiro atrás de um NAT compartilha o mesmo IP.
    "SENSITIVE_PREFIXES": [
        "/api/v1/auth/login",
        "/api/v1/auth/token",
        "/api/v1/auth/registration",
        "/api/v1/auth/password",
        "/api/v1/auth/google",
        "/admin/login/",
        "/accounts/",  # callbacks OAuth do allauth
    ],
}

# ---------------------------------------------------------------- Limites de upload
# Teto do corpo da requisição — corta POST gigante antes de chegar na view.
DATA_UPLOAD_MAX_MEMORY_SIZE = env.int("DATA_UPLOAD_MAX_MEMORY_SIZE", default=6 * 1024 * 1024)
FILE_UPLOAD_MAX_MEMORY_SIZE = 2 * 1024 * 1024  # acima disso vai para arquivo temporário
DATA_UPLOAD_MAX_NUMBER_FIELDS = 200
DATA_UPLOAD_MAX_NUMBER_FILES = 5
FILE_UPLOAD_PERMISSIONS = 0o644

# ---------------------------------------------------------------- Cabeçalhos de segurança
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

# ---------------------------------------------------------------- Logs
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {"format": "[{levelname}] {asctime} {name}: {message}", "style": "{"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "simple"},
    },
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        # Bloqueios de rate limit e tentativas de força bruta caem aqui.
        "convida.security": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "django.security": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}

# ---------------------------------------------------------------- Celery
REDIS_URL = env("REDIS_URL", default="redis://localhost:6379/0")
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "America/Sao_Paulo"

# ---------------------------------------------------------------- Stripe
STRIPE_SECRET_KEY = env("STRIPE_SECRET_KEY", default="")
STRIPE_PUBLISHABLE_KEY = env("STRIPE_PUBLISHABLE_KEY", default="")
STRIPE_WEBHOOK_SECRET = env("STRIPE_WEBHOOK_SECRET", default="")

# ---------------------------------------------------------------- E-mail
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
EMAIL_HOST = env("EMAIL_HOST", default="")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="Convida <no-reply@convida.app>")

# ---------------------------------------------------------------- i18n
LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------- Static / Media
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
