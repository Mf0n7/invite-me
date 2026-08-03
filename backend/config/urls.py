from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path, re_path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from apps.common.media import serve_media


def healthcheck(_request):
    return JsonResponse({"status": "ok"})


api_v1 = [
    # Auth — nossas views com throttle vêm PRIMEIRO e sobrescrevem as rotas
    # homônimas do dj-rest-auth/simplejwt incluídas logo abaixo.
    path("auth/", include("apps.accounts.urls")),
    # Auth — dj-rest-auth (logout, /user/, verificação de e-mail…)
    path("auth/", include("dj_rest_auth.urls")),
    path("auth/registration/", include("dj_rest_auth.registration.urls")),
    # Domínio
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
    # Documentação da API. As permissões vêm de SPECTACULAR_SETTINGS
    # ("SERVE_PERMISSIONS") — em produção, staff apenas.
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

# Uploads de mídia (fotos de evento). Servidos por um wrapper que só entrega
# extensões de imagem e força o Content-Type — ver apps/common/media.py.
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve_media, name="media"),
]
