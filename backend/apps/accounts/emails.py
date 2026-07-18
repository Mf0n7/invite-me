from django.utils.html import escape

from apps.common.emails import EMAIL_COLORS, email_button, email_fallback_link, email_notice, render_email_layout


def render_password_reset_email(user, reset_url: str, expires_in_days: int) -> tuple[str, str, str]:
    """Monta (subject, text, html) do e-mail de redefinição de senha."""
    safe_name = escape(user.get_display_name())

    body_html = f"""
    <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:{EMAIL_COLORS["foreground"]};">
      Redefinir sua senha
    </h1>
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:{EMAIL_COLORS["foreground"]};">
      Olá, {safe_name}!
    </p>
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:{EMAIL_COLORS["foreground"]};">
      Recebemos um pedido para redefinir a senha da sua conta no Convida. Clique no botão abaixo para escolher uma nova senha.
    </p>
    {email_button("Redefinir senha", reset_url)}
    {email_fallback_link(reset_url)}
    {email_notice(f"Este link expira em {expires_in_days} dia(s). Se você não pediu essa alteração, ignore este e-mail — sua senha continua a mesma.")}
    """

    html = render_email_layout(
        preview_text="Redefina sua senha do Convida. O link expira em pouco tempo.",
        body_html=body_html,
    )

    text = f"""Olá, {user.get_display_name()}!

Recebemos um pedido para redefinir a senha da sua conta no Convida.

Redefina sua senha acessando o link abaixo:
{reset_url}

Este link expira em {expires_in_days} dia(s). Se você não pediu essa alteração, ignore este e-mail — sua senha continua a mesma.

— Equipe Convida"""

    return "Redefinição de senha — Convida", text, html


def render_email_confirmation_email(user, activate_url: str, expires_in_days: int) -> tuple[str, str, str]:
    """Monta (subject, text, html) do e-mail de confirmação de e-mail."""
    safe_name = escape(user.get_display_name())

    body_html = f"""
    <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:{EMAIL_COLORS["foreground"]};">
      Confirme seu e-mail
    </h1>
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:{EMAIL_COLORS["foreground"]};">
      Olá, {safe_name}!
    </p>
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:{EMAIL_COLORS["foreground"]};">
      Falta pouco para começar a criar seus convites no Convida. Confirme seu e-mail clicando no botão abaixo.
    </p>
    {email_button("Confirmar e-mail", activate_url)}
    {email_fallback_link(activate_url)}
    {email_notice(f"Este link expira em {expires_in_days} dia(s). Se você não criou uma conta no Convida, ignore este e-mail.")}
    """

    html = render_email_layout(
        preview_text="Confirme seu e-mail para ativar sua conta no Convida.",
        body_html=body_html,
    )

    text = f"""Olá, {user.get_display_name()}!

Falta pouco para começar a criar seus convites no Convida. Confirme seu e-mail acessando o link abaixo:
{activate_url}

Este link expira em {expires_in_days} dia(s). Se você não criou uma conta no Convida, ignore este e-mail.

— Equipe Convida"""

    return "Confirme seu e-mail — Convida", text, html
