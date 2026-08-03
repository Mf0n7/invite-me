from django.urls import path, re_path

from .views import (
    DeleteAccountView,
    GoogleLogin,
    ThrottledLoginView,
    ThrottledPasswordChangeView,
    ThrottledPasswordResetConfirmView,
    ThrottledPasswordResetView,
    ThrottledRegisterView,
    ThrottledTokenObtainPairView,
    ThrottledTokenRefreshView,
    ThrottledTokenVerifyView,
)

# ATENÇÃO — duas coisas seguram a proteção destas rotas:
#
# 1. Este módulo é incluído ANTES de dj_rest_auth.urls em config/urls.py; é a
#    ordem que faz as versões com throttle atenderem.
# 2. Os padrões usam `/?$` (barra final opcional), iguais aos do dj-rest-auth.
#    Sem isso, `/api/v1/auth/login` (sem a barra) continuaria resolvendo para a
#    LoginView original — sem limite de tentativas — e o bloqueio de força bruta
#    seria contornável apagando um caractere da URL.
urlpatterns = [
    # Login / tokens
    re_path(r"^login/?$", ThrottledLoginView.as_view(), name="rest_login"),
    re_path(r"^token/?$", ThrottledTokenObtainPairView.as_view(), name="token_obtain_pair"),
    re_path(r"^token/refresh/?$", ThrottledTokenRefreshView.as_view(), name="token_refresh"),
    re_path(r"^token/verify/?$", ThrottledTokenVerifyView.as_view(), name="token_verify"),
    # Registro
    re_path(r"^registration/?$", ThrottledRegisterView.as_view(), name="rest_register"),
    # Senha
    re_path(
        r"^password/reset/?$", ThrottledPasswordResetView.as_view(), name="rest_password_reset"
    ),
    re_path(
        r"^password/reset/confirm/?$",
        ThrottledPasswordResetConfirmView.as_view(),
        name="rest_password_reset_confirm",
    ),
    re_path(
        r"^password/change/?$",
        ThrottledPasswordChangeView.as_view(),
        name="rest_password_change",
    ),
    # Social + conta
    path("google/", GoogleLogin.as_view(), name="google_login"),
    path("user/delete/", DeleteAccountView.as_view(), name="account_delete"),
]
