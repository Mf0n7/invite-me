"""Processamento dos eventos de webhook do Stripe (idempotente)."""
from datetime import datetime, timezone

from .models import EventPurchase, Subscription


def _to_dt(ts):
    return datetime.fromtimestamp(ts, tz=timezone.utc) if ts else None


def handle_event(event: dict) -> None:
    event_type = event["type"]
    obj = event["data"]["object"]

    if event_type == "checkout.session.completed":
        _handle_checkout_completed(obj)
    elif event_type in ("customer.subscription.updated", "customer.subscription.created"):
        _handle_subscription_change(obj)
    elif event_type == "customer.subscription.deleted":
        _handle_subscription_deleted(obj)


def _handle_checkout_completed(session: dict) -> None:
    meta = session.get("metadata") or {}
    kind = meta.get("kind")

    if kind == "event_purchase":
        purchase = EventPurchase.objects.filter(id=meta.get("purchase_id")).first()
        if purchase and purchase.status != EventPurchase.Status.PAID:
            purchase.status = EventPurchase.Status.PAID
            purchase.stripe_payment_intent = session.get("payment_intent") or ""
            purchase.save(update_fields=["status", "stripe_payment_intent"])

    elif kind == "subscription":
        user_id = meta.get("user_id")
        capacity = int(meta.get("capacity") or 0)
        Subscription.objects.update_or_create(
            user_id=user_id,
            defaults={
                "capacity": capacity,
                "status": Subscription.Status.ACTIVE,
                "stripe_customer_id": session.get("customer") or "",
                "stripe_subscription_id": session.get("subscription") or "",
            },
        )


def _handle_subscription_change(sub: dict) -> None:
    sub_id = sub.get("id")
    existing = Subscription.objects.filter(stripe_subscription_id=sub_id).first()
    if not existing:
        return
    meta = sub.get("metadata") or {}
    if meta.get("capacity"):
        existing.capacity = int(meta["capacity"])
    existing.status = sub.get("status", existing.status)
    existing.current_period_end = _to_dt(sub.get("current_period_end"))
    existing.save()


def _handle_subscription_deleted(sub: dict) -> None:
    existing = Subscription.objects.filter(stripe_subscription_id=sub.get("id")).first()
    if existing:
        existing.status = Subscription.Status.CANCELED
        existing.save(update_fields=["status"])
