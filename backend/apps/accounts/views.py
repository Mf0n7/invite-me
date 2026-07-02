from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
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
    """Exclui a própria conta do usuário autenticado (ação irreversível).

    O endpoint padrão /auth/user/ (dj-rest-auth) não aceita DELETE — por isso
    esta rota dedicada. A identidade é garantida pelo JWT; após excluir, os
    tokens do usuário deixam de autenticar (o usuário não existe mais).
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
