from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.events.models import Event


class SubscriptionPlan(models.Model):
    """Faixa de assinatura recorrente — espelha um Price recorrente do Stripe."""

    capacity = models.PositiveIntegerField(_("capacidade"), unique=True)
    amount_cents = models.PositiveIntegerField(_("valor (centavos)"))
    stripe_price_id = models.CharField(max_length=100, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("plano de assinatura")
        verbose_name_plural = _("planos de assinatura")
        ordering = ["capacity"]

    def __str__(self):
        return f"Assinatura até {self.capacity}"

#
class Subscription(models.Model):
    """Assinatura ativa de um usuário — vale para todos os eventos dele."""

    class Status(models.TextChoices):
        ACTIVE = "active", _("Ativa")
        TRIALING = "trialing", _("Em teste")
        PAST_DUE = "past_due", _("Pagamento pendente")
        CANCELED = "canceled", _("Cancelada")

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscription"
    )
    capacity = models.PositiveIntegerField(_("capacidade"), default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("assinatura")
        verbose_name_plural = _("assinaturas")

    def __str__(self):
        return f"{self.user} · até {self.capacity} ({self.status})"

    @property
    def is_active(self) -> bool:
        if self.status not in (self.Status.ACTIVE, self.Status.TRIALING):
            return False
        if self.current_period_end and self.current_period_end < timezone.now():
            return False
        return True


class EventPurchase(models.Model):
    """Compra avulsa para um evento (faixa de capacidade ou addon de presentes)."""

    class Status(models.TextChoices):
        PENDING = "pending", _("Pendente")
        PAID = "paid", _("Pago")
        FAILED = "failed", _("Falhou")

    class Kind(models.TextChoices):
        CAPACITY = "capacity", _("Faixa de capacidade")
        GIFT = "gift", _("Lista de presentes")

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="purchases")
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.CAPACITY)
    capacity = models.PositiveIntegerField(_("capacidade"), default=0)
    amount_cents = models.PositiveIntegerField(_("valor (centavos)"))
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    stripe_session_id = models.CharField(max_length=255, blank=True, db_index=True)
    stripe_payment_intent = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("compra de evento")
        verbose_name_plural = _("compras de evento")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.event.title} · até {self.capacity} ({self.status})"
