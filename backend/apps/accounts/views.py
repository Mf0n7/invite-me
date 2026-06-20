from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView


class GoogleLogin(SocialLoginView):
    """Troca o código do Google por um par de tokens JWT do Convida.

    O frontend usa o fluxo auth-code em popup (Google Identity Services), então
    a troca do código no servidor usa redirect_uri = "postmessage".
    """

    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = "postmessage"
