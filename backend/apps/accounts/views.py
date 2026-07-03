from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class GoogleLogin(SocialLoginView):
    """Troca o código do Google por um par de tokens JWT do Convida.

    O frontend usa o fluxo auth-code em popup (Google Identity Services), então
    a troca do código no servidor usa redirect_uri = "postmessage".
    """

    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = "postmessage"


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
