import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


def event_photo_path(instance, filename):
    return f"events/{instance.uuid}/{filename}"


class Event(models.Model):
    """Evento criado por um usuário (dono)."""

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="events",
        verbose_name=_("dono"),
    )

    title = models.CharField(_("título"), max_length=140)
    description = models.TextField(_("descrição"), blank=True)
    photo = models.ImageField(_("foto"), upload_to=event_photo_path, blank=True, null=True)

    address = models.CharField(_("endereço"), max_length=255)
    location_link = models.URLField(_("link da localização"), blank=True)
    starts_at = models.DateTimeField(_("data e horário"))
    note = models.TextField(_("observação"), blank=True)

    allow_companions = models.BooleanField(_("permite acompanhantes"), default=False)
    max_companions = models.PositiveSmallIntegerField(_("máx. de acompanhantes"), default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("evento")
        verbose_name_plural = _("eventos")
        ordering = ["-starts_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Coerência: sem acompanhantes => limite zero.
        if not self.allow_companions:
            self.max_companions = 0
        super().save(*args, **kwargs)

    # ---- Link público de convite ----
    def active_link(self):
        return self.links.filter(is_active=True).first()

    def ensure_link(self):
        """Retorna o link ativo, criando um se ainda não existir."""
        return self.active_link() or self.links.create()

    def regenerate_link(self):
        """Invalida o link atual e gera um novo (anula o anterior)."""
        self.links.filter(is_active=True).update(is_active=False)
        return self.links.create()


class EventLink(models.Model):
    """Link genérico e dinâmico de convite. Só um fica ativo por evento."""

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="links")
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("link de convite")
        verbose_name_plural = _("links de convite")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.event.title} · {self.token}"
