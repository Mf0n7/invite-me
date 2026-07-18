"""Layout base dos e-mails transacionais do Convida (mesma identidade visual do frontend, ver frontend/lib/emails/templates/layout.ts)."""

from datetime import datetime

from django.conf import settings
from django.utils.html import escape

EMAIL_COLORS = {
    "primary": "#06ACC6",
    "primary_dark": "#0592A8",
    "celebrate": "#F65169",
    "foreground": "#0F2229",
    "muted_foreground": "#5A6C72",
    "background": "#FAFEFF",
    "card": "#FFFFFF",
    "border": "#D6E2E6",
    "secondary": "#E6F3F4",
}


def email_button(label: str, url: str) -> str:
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


def email_notice(text: str) -> str:
    return f"""
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 0;">
      <tr>
        <td bgcolor="{EMAIL_COLORS["secondary"]}" style="border-left:3px solid {EMAIL_COLORS["celebrate"]};border-radius:8px;padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:{EMAIL_COLORS["foreground"]};">
          {text}
        </td>
      </tr>
    </table>"""


def email_fallback_link(url: str) -> str:
    safe_url = escape(url)
    return f"""
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:{EMAIL_COLORS["muted_foreground"]};">
      Se o botão não funcionar, copie e cole este link no navegador:<br />
      <a href="{safe_url}" target="_blank" rel="noopener" style="color:{EMAIL_COLORS["primary"]};word-break:break-all;">{safe_url}</a>
    </p>"""


def render_email_layout(preview_text: str, body_html: str) -> str:
    logo_url = f"{settings.FRONTEND_URL}/icons/icon-192.png"
    year = datetime.now().year

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Convida</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
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
