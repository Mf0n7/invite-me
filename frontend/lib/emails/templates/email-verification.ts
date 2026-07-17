import {
  EMAIL_COLORS,
  emailButton,
  emailFallbackLink,
  emailNotice,
  escapeHtml,
  renderEmailLayout,
  type EmailTemplateResult,
} from "./layout";

export interface EmailVerificationEmailProps {
  /** Nome de exibição do destinatário. */
  name: string;
  /** Link completo (com token) para confirmação do e-mail. */
  verificationUrl: string;
  /** Validade do link, em minutos. */
  expiresInMinutes?: number;
}

export function emailVerificationEmail({
  name,
  verificationUrl,
  expiresInMinutes = 60,
}: EmailVerificationEmailProps): EmailTemplateResult {
  const safeName = escapeHtml(name);

  const bodyHtml = `
    <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:${EMAIL_COLORS.foreground};">
      Confirme seu e-mail
    </h1>
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${EMAIL_COLORS.foreground};">
      Olá, ${safeName}!
    </p>
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${EMAIL_COLORS.foreground};">
      Falta pouco para começar a criar seus convites no Convida. Confirme seu e-mail clicando no botão abaixo.
    </p>
    ${emailButton("Confirmar e-mail", verificationUrl)}
    ${emailFallbackLink(verificationUrl)}
    ${emailNotice(`Este link expira em ${expiresInMinutes} minutos. Se você não criou uma conta no Convida, ignore este e-mail.`)}
  `;

  const html = renderEmailLayout({
    previewText: "Confirme seu e-mail para ativar sua conta no Convida.",
    bodyHtml,
  });

  const text = `Olá, ${name}!

Falta pouco para começar a criar seus convites no Convida. Confirme seu e-mail acessando o link abaixo:
${verificationUrl}

Este link expira em ${expiresInMinutes} minutos. Se você não criou uma conta no Convida, ignore este e-mail.

— Equipe Convida`;

  return {
    subject: "Confirme seu e-mail — Convida",
    html,
    text,
  };
}
