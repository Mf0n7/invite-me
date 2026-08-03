"""Views de conta e autenticação.

As views de login/registro/reset do dj-rest-auth são reexportadas aqui com
throttles acoplados. Os caminhos abaixo são registrados **antes** dos
`include()` do dj-rest-auth em `config/urls.py`, então estas versões é que
respondem — as originais, sem limite, ficam inalcançáveis.
"""
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import RegisterView, SocialLoginView
from dj_rest_auth.views import (
    LoginView,
    PasswordChangeView,
    PasswordResetConfirmView,
    PasswordResetView,
)
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from apps.common.throttling import (
    LoginBruteForceThrottle,
    LoginIpThrottle,
    ScopedSustainedThrottle,
    ScopedThrottle,
)


# --------------------------------------------------------------- login (e-mail/senha)
@extend_schema(tags=["Conta & Autenticação"])
class ThrottledLoginView(LoginView):
    """Login com proteção contra força bruta.

    Dois limites somados:

    * por **par (IP, e-mail)** — 10 tentativas/min; após o primeiro bloqueio o
      par entra em modo estrito por 15 min e passa a 5 tentativas/min;
    * por **IP** — 30 tentativas/min no total, o que impede tentar uma senha
      contra centenas de e-mails diferentes (*password spraying*).

    Só tentativa falha conta: em caso de sucesso a janela do par é zerada.
    """

    throttle_classes = [LoginBruteForceThrottle, LoginIpThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            LoginBruteForceThrottle.reset(request)
        return response


@extend_schema(tags=["Conta & Autenticação"])
class ThrottledTokenObtainPairView(TokenObtainPairView):
    """/auth/token/ — mesma proteção do login (é um caminho alternativo para ele)."""

    throttle_classes = [LoginBruteForceThrottle, LoginIpThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            LoginBruteForceThrottle.reset(request)
        return response


@extend_schema(tags=["Conta & Autenticação"])
class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_classes = [ScopedThrottle]
    throttle_scope = "token_refresh"


@extend_schema(tags=["Conta & Autenticação"])
class ThrottledTokenVerifyView(TokenVerifyView):
    throttle_classes = [ScopedThrottle]
    throttle_scope = "token_refresh"


# --------------------------------------------------------------- registro
@extend_schema(tags=["Conta & Autenticação"])
class ThrottledRegisterView(RegisterView):
    """Cadastro — 5/min e 20/h por IP. Barra criação de contas em massa."""

    throttle_classes = [ScopedThrottle, ScopedSustainedThrottle]
    throttle_scope = "register"
    throttle_scope_sustained = "register_sustained"


# --------------------------------------------------------------- senha
@extend_schema(tags=["Conta & Autenticação"])
class ThrottledPasswordResetView(PasswordResetView):
    """Reset de senha — 5/min e 15/h por IP (também evita usar a API como
    disparador de spam de e-mail)."""

    throttle_classes = [ScopedThrottle, ScopedSustainedThrottle]
    throttle_scope = "password_reset"
    throttle_scope_sustained = "password_reset_sustained"


@extend_schema(tags=["Conta & Autenticação"])
class ThrottledPasswordResetConfirmView(PasswordResetConfirmView):
    """Confirmação do reset — limita força bruta sobre o token do e-mail."""

    throttle_classes = [ScopedThrottle, ScopedSustainedThrottle]
    throttle_scope = "password_reset"
    throttle_scope_sustained = "password_reset_sustained"


@extend_schema(tags=["Conta & Autenticação"])
class ThrottledPasswordChangeView(PasswordChangeView):
    throttle_classes = [ScopedThrottle]
    throttle_scope = "password_reset"


# --------------------------------------------------------------- Google SSO
@extend_schema(tags=["Conta & Autenticação"])
class GoogleLogin(SocialLoginView):
    """Troca o código do Google por um par de tokens JWT do Convida.

    O frontend usa o fluxo auth-code em popup (Google Identity Services), então
    a troca do código no servidor usa redirect_uri = "postmessage".

    Não há senha a adivinhar aqui (o segredo é o code de uso único do Google),
    então basta o teto por IP para impedir flood contra a API do Google.
    """

    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = "postmessage"
    throttle_classes = [LoginIpThrottle]


# --------------------------------------------------------------- conta
@extend_schema(tags=["Conta & Autenticação"])
class DeleteAccountView(APIView):
    """Exclui a própria conta do usuário autenticado (soft delete).

    Em vez de apagar o registro, desativa a conta (is_active=False) e marca
    deleted_at — preserva o histórico (eventos, confirmações, logs). O endpoint
    padrão /auth/user/ (dj-rest-auth) não aceita DELETE, por isso esta rota
    dedicada. Conta desativada não consegue mais logar (Django bloqueia inativo).
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.is_active = False
        user.deleted_at = timezone.now()
        user.save(update_fields=["is_active", "deleted_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)
