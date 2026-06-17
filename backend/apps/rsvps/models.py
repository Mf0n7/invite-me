from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.events.models import Event, EventLink


class Rsvp(models.Model):
    """Confirmação de presença feita por um convidado via link público."""

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="rsvps")
    link = models.ForeignKey(
        EventLink,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rsvps",
    )
    invitation = models.OneToOneField(
        "invitations.Invitation",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="rsvp",
    )
    name = models.CharField(_("nome"), max_length=120)
    companion_names = models.JSONField(_("nomes dos acompanhantes"), default=list, blank=True)
    companions_count = models.PositiveSmallIntegerField(_("acompanhantes"), default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("confirmação")
        verbose_name_plural = _("confirmações")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} · {self.event.title}"

    def save(self, *args, **kwargs):
        # A quantidade sempre reflete os nomes informados.
        self.companions_count = len(self.companion_names or [])
        super().save(*args, **kwargs)

    @property
    def total_people(self) -> int:
        """A própria pessoa + acompanhantes (acompanhantes contam na capacidade)."""
        return 1 + self.companions_count
