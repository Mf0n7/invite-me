import logging

from django.conf import settings
from django.core.mail import send_mail
from django.utils.html import escape

from apps.common.emails import EMAIL_COLORS, email_button, email_fallback_link, render_email_layout

logger = logging.getLogger(__name__)


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
    {email_button("Gerenciar evento", link)}
    {email_fallback_link(link)}
    """

        html_message = render_email_layout(
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
