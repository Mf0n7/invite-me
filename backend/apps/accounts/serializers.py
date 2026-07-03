from allauth.account.utils import user_pk_to_url_str
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import PasswordResetSerializer
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from .models import User


def frontend_reset_url(request, user, temp_key) -> str:
    """Link de redefinição de senha apontando para a página do frontend."""
    uid = user_pk_to_url_str(user)
    return f"{settings.FRONTEND_URL}/reset-password/{uid}/{temp_key}"


class CustomPasswordResetSerializer(PasswordResetSerializer):
    """Gera o e-mail de redefinição com link para o frontend."""

    def get_email_options(self):
        return {"url_generator": frontend_reset_url}


class CustomRegisterSerializer(RegisterSerializer):
    """Registro por e-mail (sem username) com nome completo opcional."""

    username = None  # remove o campo herdado
    full_name = serializers.CharField(required=False, allow_blank=True, max_length=150)

    def validate_email(self, email):
        # Com ACCOUNT_EMAIL_VERIFICATION="optional", a checagem padrão só barra
        # e-mail duplicado se já estiver verificado — sem isso, o save() bate no
        # unique do model e estoura IntegrityError (500). Barramos aqui (400).
        email = super().validate_email(email)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                _("Um usuário já está registrado com este endereço de e-mail.")
            )
        return email

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data["full_name"] = self.validated_data.get("full_name", "")
        return data

    def custom_signup(self, request, user):
        full_name = self.validated_data.get("full_name", "")
        if full_name:
            user.full_name = full_name
            user.save(update_fields=["full_name"])


class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "display_name",
            "avatar_url",
            "date_joined",
            "is_staff",
            "is_superuser",
        ]
        read_only_fields = ["id", "email", "date_joined", "is_staff", "is_superuser"]

    def get_display_name(self, obj) -> str:
        return obj.get_display_name()
