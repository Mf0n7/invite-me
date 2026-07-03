from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)


def healthcheck(_request):
    return JsonResponse({"status": "ok"})


api_v1 = [
    # Auth — JWT
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # Auth — dj-rest-auth (login/logout/registro/usuário) + social (Google)
    path("auth/", include("dj_rest_auth.urls")),
    path("auth/registration/", include("dj_rest_auth.registration.urls")),
    path("auth/", include("apps.accounts.urls")),
    # Domínio (preenchido nas próximas fases)
    path("", include("apps.events.urls")),
    path("", include("apps.invitations.urls")),
    path("", include("apps.rsvps.urls")),
    path("", include("apps.gifts.urls")),
    path("", include("apps.billing.urls")),
    path("", include("apps.administration.urls")),
]

urlpatterns = [
    path("healthz/", healthcheck, name="healthz"),
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),  # callbacks OAuth do allauth
    path("api/v1/", include((api_v1, "api"), namespace="v1")),
    # Documentação da API
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
