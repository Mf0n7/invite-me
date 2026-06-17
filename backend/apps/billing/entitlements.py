"""Resolução de acesso (entitlements) do O Penetra.

A contagem de confirmados é sempre livre. Os NOMES são revelados até a
capacidade liberada, que vem da maior fonte entre:
  - faixa grátis (20)
  - maior compra avulsa 'paga' do evento
  - assinatura ativa do dono
"""
from apps.events.models import Event

from .constants import FREE_CAPACITY
from .models import EventPurchase, Subscription


def name_capacity_for_event(event: Event) -> int:
    capacity = FREE_CAPACITY

    paid = (
        EventPurchase.objects.filter(event=event, status=EventPurchase.Status.PAID)
        .order_by("-capacity")
        .first()
    )
    if paid:
        capacity = max(capacity, paid.capacity)

    sub = Subscription.objects.filter(user=event.owner).first()
    if sub and sub.is_active:
        capacity = max(capacity, sub.capacity)

    return capacity
