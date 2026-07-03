from django.urls import path

from .views import DeleteAccountView, GoogleLogin

urlpatterns = [
    path("google/", GoogleLogin.as_view(), name="google_login"),
    path("user/delete/", DeleteAccountView.as_view(), name="account_delete"),
]
