import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_event_created_email(event):
    """Avisa o dono que o evento foi criado. Falha de e-mail não quebra o fluxo."""
    try:
        link = f"{settings.FRONTEND_URL}/dashboard/events/{event.uuid}/edit"
        send_mail(
            subject=f"Seu evento “{event.title}” foi criado! 🎉",
            message=(
                f"Olá!\n\nSeu evento “{event.title}” foi criado no Convida.\n"
                f"Gerencie convites, confirmações e lista de presentes aqui:\n{link}\n\n"
                "Boa festa!\n— Convida"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[event.owner.email],
            fail_silently=True,
        )
    except Exception:  # noqa: BLE001
        logger.exception("Falha ao enviar e-mail de criação do evento %s", event.pk)
