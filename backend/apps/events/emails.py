import logging
from datetime import datetime

from django.conf import settings
from django.core.mail import send_mail
from django.utils.html import escape

logger = logging.getLogger(__name__)

EMAIL_COLORS = {
    "primary": "#06ACC6",
    "celebrate": "#F65169",
    "foreground": "#0F2229",
    "muted_foreground": "#5A6C72",
    "background": "#FAFEFF",
    "card": "#FFFFFF",
}


def _email_button(label: str, url: str) -> str:
    safe_url = escape(url)
    return f"""
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:32px auto;">
      <tr>
        <td align="center" bgcolor="{EMAIL_COLORS["primary"]}" style="border-radius:999px;">
          <a href="{safe_url}" target="_blank" rel="noopener"
            style="display:inline-block;padding:14px 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:999px;">
            {escape(label)}
          </a>
        </td>
      </tr>
    </table>"""


def _email_fallback_link(url: str) -> str:
    safe_url = escape(url)
    return f"""
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:{EMAIL_COLORS["muted_foreground"]};">
      Se o botão não funcionar, copie e cole este link no navegador:<br />
      <a href="{safe_url}" target="_blank" rel="noopener" style="color:{EMAIL_COLORS["primary"]};word-break:break-all;">{safe_url}</a>
    </p>"""


def _render_email_layout(preview_text: str, body_html: str) -> str:
    logo_url = f"{settings.FRONTEND_URL}/icons/icon-192.png"
    year = datetime.now().year

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Convida</title>
  </head>
  <body style="margin:0;padding:0;background-color:{EMAIL_COLORS["background"]};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:{EMAIL_COLORS["background"]};">
      {escape(preview_text)}
      &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:{EMAIL_COLORS["background"]};">
      <tr>
        <td align="center" style="padding:40px 16px;">

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;">
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle" style="padding-right:10px;">
                      <img src="{logo_url}" width="32" height="32" alt="Convida" style="display:block;border-radius:8px;" />
                    </td>
                    <td valign="middle">
                      <span style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:{EMAIL_COLORS["foreground"]};letter-spacing:-0.02em;">Convida</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="background-color:{EMAIL_COLORS["card"]};border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(6,172,198,0.10);">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td height="4" style="background:linear-gradient(90deg,{EMAIL_COLORS["primary"]},{EMAIL_COLORS["celebrate"]});font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding:40px 36px;">
                      {body_html}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:28px 24px 0;">
                <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:{EMAIL_COLORS["muted_foreground"]};">
                  Você recebeu este e-mail porque possui uma conta no Convida.
                </p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:{EMAIL_COLORS["muted_foreground"]};">
                  <a href="mailto:suporte@convida.app" style="color:{EMAIL_COLORS["muted_foreground"]};">suporte@convida.app</a>
                  &nbsp;·&nbsp;
                  &copy; {year} Convida
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>"""


def send_event_created_email(event):
    """Avisa o dono que o evento foi criado. Falha de e-mail não quebra o fluxo."""
    try:
        link = f"{settings.FRONTEND_URL}/dashboard/events/{event.uuid}/edit"
        safe_title = escape(event.title)
        safe_name = escape(event.owner.get_display_name())

        body_html = f"""
    <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:{EMAIL_COLORS["foreground"]};">
      Seu evento foi criado! 🎉
    </h1>
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:{EMAIL_COLORS["foreground"]};">
      Olá, {safe_name}!
    </p>
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:{EMAIL_COLORS["foreground"]};">
      O evento “{safe_title}” já está pronto no Convida. Gerencie convites, confirmações e lista de presentes por lá.
    </p>
    {_email_button("Gerenciar evento", link)}
    {_email_fallback_link(link)}
    """

        html_message = _render_email_layout(
            preview_text=f"Seu evento “{event.title}” foi criado no Convida.",
            body_html=body_html,
        )

        send_mail(
            subject=f"Seu evento “{event.title}” foi criado! 🎉",
            message=(
                f"Olá!\n\nSeu evento “{event.title}” foi criado no Convida.\n"
                f"Gerencie convites, confirmações e lista de presentes aqui:\n{link}\n\n"
                "Boa festa!\n— Convida"
            ),
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[event.owner.email],
            fail_silently=True,
        )
    except Exception:  # noqa: BLE001
        logger.exception("Falha ao enviar e-mail de criação do evento %s", event.pk)
