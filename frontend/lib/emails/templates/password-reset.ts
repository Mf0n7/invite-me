import {
  EMAIL_COLORS,
  emailButton,
  emailFallbackLink,
  emailNotice,
  escapeHtml,
  renderEmailLayout,
  type EmailTemplateResult,
} from "./layout";

export interface PasswordResetEmailProps {
  /** Nome de exibição do destinatário. */
  name: string;
  /** Link completo (com token) para a tela de redefinição de senha. */
  resetUrl: string;
  /** Validade do link, em minutos. */
  expiresInMinutes?: number;
}

export function passwordResetEmail({
  name,
  resetUrl,
  expiresInMinutes = 60,
}: PasswordResetEmailProps): EmailTemplateResult {
  const safeName = escapeHtml(name);

  const bodyHtml = `
    <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:${EMAIL_COLORS.foreground};">
      Redefinir sua senha
    </h1>
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${EMAIL_COLORS.foreground};">
      Olá, ${safeName}!
    </p>
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${EMAIL_COLORS.foreground};">
      Recebemos um pedido para redefinir a senha da sua conta no Convida. Clique no botão abaixo para escolher uma nova senha.
    </p>
    ${emailButton("Redefinir senha", resetUrl)}
    ${emailFallbackLink(resetUrl)}
    ${emailNotice(`Este link expira em ${expiresInMinutes} minutos. Se você não pediu essa alteração, ignore este e-mail — sua senha continua a mesma.`)}
  `;

  const html = renderEmailLayout({
    previewText: "Redefina sua senha do Convida. O link expira em pouco tempo.",
    bodyHtml,
  });

  const text = `Olá, ${name}!

Recebemos um pedido para redefinir a senha da sua conta no Convida.

Redefina sua senha acessando o link abaixo:
${resetUrl}

Este link expira em ${expiresInMinutes} minutos. Se você não pediu essa alteração, ignore este e-mail — sua senha continua a mesma.

— Equipe Convida`;

  return {
    subject: "Redefinição de senha — Convida",
    html,
    text,
  };
}
