import uuid

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.events.models import Event


class Invitation(models.Model):
    """Convite nominal: um link único por pessoa, de uso único."""

    class Status(models.TextChoices):
        PENDING = "pending", _("Pendente")
        CONFIRMED = "confirmed", _("Confirmado")

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="invitations")
    guest_name = models.CharField(_("nome do convidado"), max_length=120)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(
        _("situação"), max_length=10, choices=Status.choices, default=Status.PENDING
    )
    confirmed_at = models.DateTimeField(_("confirmado em"), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("convite nominal")
        verbose_name_plural = _("convites nominais")
        ordering = ["guest_name"]

    def __str__(self):
        return f"{self.guest_name} · {self.event.title}"

    @property
    def owner(self):
        return self.event.owner

    @property
    def is_confirmed(self) -> bool:
        return self.status == self.Status.CONFIRMED

    def mark_confirmed(self):
        self.status = self.Status.CONFIRMED
        self.confirmed_at = timezone.now()
        self.save(update_fields=["status", "confirmed_at"])
