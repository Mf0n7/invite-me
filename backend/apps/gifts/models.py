from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.events.models import Event


class GiftItem(models.Model):
    """Item da lista de presentes de um evento."""

    class Status(models.TextChoices):
        AVAILABLE = "available", _("Disponível")
        RESERVED = "reserved", _("Reservado")

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="gifts")
    title = models.CharField(_("título"), max_length=140)
    description = models.TextField(_("descrição"), blank=True)
    url = models.URLField(_("link da loja"), blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.AVAILABLE)
    claimed_by_name = models.CharField(_("reservado por"), max_length=120, blank=True)
    claimed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("presente")
        verbose_name_plural = _("presentes")
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.title} · {self.event.title}"

    @property
    def owner(self):
        return self.event.owner

    @property
    def is_available(self) -> bool:
        return self.status == self.Status.AVAILABLE

    def claim(self, name: str):
        self.status = self.Status.RESERVED
        self.claimed_by_name = name
        self.claimed_at = timezone.now()
        self.save(update_fields=["status", "claimed_by_name", "claimed_at"])
