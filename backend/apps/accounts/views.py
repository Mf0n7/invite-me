from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings


class GoogleLogin(SocialLoginView):
    """Troca o token/código do Google por um par de tokens JWT do O Penetra."""

    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = f"{settings.FRONTEND_URL}/auth/google/callback"
