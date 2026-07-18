from allauth.account import app_settings as allauth_account_settings
from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from apps.accounts.emails import render_email_confirmation_email, render_password_reset_email

PASSWORD_RESET_PREFIX = "account/email/password_reset_key"
EMAIL_CONFIRMATION_PREFIXES = {"account/email/email_confirmation", "account/email/email_confirmation_signup"}


class AccountAdapter(DefaultAccountAdapter):
    """Usa o layout HTML novo (mesma identidade visual do frontend) nos e-mails de confirmação e redefinição de senha."""

    def render_mail(self, template_prefix, email, context, headers=None):
        if template_prefix == PASSWORD_RESET_PREFIX:
            expires_days = max(1, settings.PASSWORD_RESET_TIMEOUT // 86400)
            subject, text, html = render_password_reset_email(
                context["user"], context["password_reset_url"], expires_days
            )
        elif template_prefix in EMAIL_CONFIRMATION_PREFIXES:
            expires_days = allauth_account_settings.EMAIL_CONFIRMATION_EXPIRE_DAYS
            subject, text, html = render_email_confirmation_email(
                context["user"], context["activate_url"], expires_days
            )
        else:
            return super().render_mail(template_prefix, email, context, headers)

        to = [email] if isinstance(email, str) else email
        msg = EmailMultiAlternatives(
            self.format_email_subject(subject), text, self.get_from_email(), to, headers=headers
        )
        msg.attach_alternative(html, "text/html")
        return msg


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    """Popula full_name/avatar do nosso User a partir dos dados do provedor (Google)."""

    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)

        extra = getattr(sociallogin.account, "extra_data", {}) or {}
        name = (
            data.get("name")
            or extra.get("name")
            or " ".join(filter(None, [data.get("first_name"), data.get("last_name")])).strip()
        )
        if name and not user.full_name:
            user.full_name = name[:150]

        picture = data.get("picture") or extra.get("picture")
        if picture and not user.avatar_url:
            user.avatar_url = picture

        return user
