/**
 * Layout base dos e-mails transacionais do Convida.
 * HTML com tabelas e estilos inline (compatibilidade com Gmail/Outlook/Apple Mail).
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://convida.app";

export const EMAIL_COLORS = {
  primary: "#06ACC6",
  primaryDark: "#0592A8",
  celebrate: "#F65169",
  foreground: "#0F2229",
  mutedForeground: "#5A6C72",
  background: "#FAFEFF",
  card: "#FFFFFF",
  border: "#D6E2E6",
  secondary: "#E6F3F4",
} as const;

export interface EmailTemplateResult {
  subject: string;
  html: string;
  text: string;
}

/** Escapa texto vindo do usuário antes de interpolar em HTML (nome, e-mail etc.). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Botão de call-to-action centralizado. */
export function emailButton(label: string, url: string): string {
  const safeUrl = escapeHtml(url);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:32px auto;">
      <tr>
        <td align="center" bgcolor="${EMAIL_COLORS.primary}" style="border-radius:999px;">
          <a href="${safeUrl}" target="_blank" rel="noopener"
            style="display:inline-block;padding:14px 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:999px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

/** Caixa de aviso discreta (ex.: prazo de expiração de um link). */
export function emailNotice(text: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 0;">
      <tr>
        <td bgcolor="${EMAIL_COLORS.secondary}" style="border-left:3px solid ${EMAIL_COLORS.celebrate};border-radius:8px;padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${EMAIL_COLORS.foreground};">
          ${text}
        </td>
      </tr>
    </table>`;
}

/** Link alternativo (fallback quando o botão não é clicável no cliente de e-mail). */
export function emailFallbackLink(url: string): string {
  const safeUrl = escapeHtml(url);
  return `
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${EMAIL_COLORS.mutedForeground};">
      Se o botão não funcionar, copie e cole este link no navegador:<br />
      <a href="${safeUrl}" target="_blank" rel="noopener" style="color:${EMAIL_COLORS.primary};word-break:break-all;">${safeUrl}</a>
    </p>`;
}

export interface EmailLayoutOptions {
  /** Texto curto exibido como prévia na caixa de entrada (fica oculto no corpo). */
  previewText: string;
  /** HTML já pronto do miolo do e-mail (título, parágrafos, botão etc.). */
  bodyHtml: string;
}

export function renderEmailLayout({ previewText, bodyHtml }: EmailLayoutOptions): string {
  const logoUrl = `${SITE_URL}/icons/icon-192.png`;

  return `<!DOCTYPE html>
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
  <body style="margin:0;padding:0;background-color:${EMAIL_COLORS.background};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${EMAIL_COLORS.background};">
      ${escapeHtml(previewText)}
      &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${EMAIL_COLORS.background};">
      <tr>
        <td align="center" style="padding:40px 16px;">

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;">
            <!-- Logo -->
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle" style="padding-right:10px;">
                      <img src="${logoUrl}" width="32" height="32" alt="Convida" style="display:block;border-radius:8px;" />
                    </td>
                    <td valign="middle">
                      <span style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:${EMAIL_COLORS.foreground};letter-spacing:-0.02em;">Convida</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td style="background-color:${EMAIL_COLORS.card};border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(6,172,198,0.10);">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td height="4" style="background:linear-gradient(90deg,${EMAIL_COLORS.primary},${EMAIL_COLORS.celebrate});font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding:40px 36px;">
                      ${bodyHtml}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Rodapé -->
            <tr>
              <td align="center" style="padding:28px 24px 0;">
                <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${EMAIL_COLORS.mutedForeground};">
                  Você recebeu este e-mail porque possui uma conta no Convida.
                </p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${EMAIL_COLORS.mutedForeground};">
                  <a href="mailto:suporte@convida.app" style="color:${EMAIL_COLORS.mutedForeground};">suporte@convida.app</a>
                  &nbsp;·&nbsp;
                  &copy; ${new Date().getFullYear()} Convida
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>`;
}
