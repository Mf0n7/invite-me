"""Integração com o Stripe (Checkout hospedado, modo teste)."""
import stripe
from django.conf import settings

from .constants import CURRENCY, subscription_price_cents, tier_label


def stripe_enabled() -> bool:
    return bool(settings.STRIPE_SECRET_KEY)


def _client():
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def _front(path: str) -> str:
    return f"{settings.FRONTEND_URL}{path}"


def create_event_checkout(purchase) -> str:
    """Cria uma Checkout Session avulsa (pagamento único) e retorna a URL."""
    client = _client()
    event = purchase.event
    if purchase.kind == purchase.Kind.GIFT:
        product_name = f"Lista de presentes · {event.title}"
    else:
        product_name = f"{tier_label(purchase.capacity)} · {event.title}"
    session = client.checkout.Session.create(
        mode="payment",
        # Sem payment_method_types fixo: o Checkout usa os métodos habilitados
        # no painel do Stripe (cartão por padrão; Pix se você ativar).
        line_items=[
            {
                "quantity": 1,
                "price_data": {
                    "currency": CURRENCY,
                    "unit_amount": purchase.amount_cents,
                    "product_data": {"name": product_name},
                },
            }
        ],
        metadata={
            "kind": "event_purchase",
            "purchase_id": str(purchase.id),
            "event_uuid": str(event.uuid),
        },
        success_url=_front(f"/dashboard/events/{event.uuid}/edit?checkout=success"),
        cancel_url=_front(f"/dashboard/events/{event.uuid}/edit?checkout=cancel"),
    )
    purchase.stripe_session_id = session.id
    purchase.save(update_fields=["stripe_session_id"])
    return session.url


def create_subscription_checkout(user, plan) -> str:
    """Cria uma Checkout Session de assinatura e retorna a URL."""
    client = _client()
    session = client.checkout.Session.create(
        mode="subscription",
        customer_email=user.email,
        line_items=[{"price": plan.stripe_price_id, "quantity": 1}],
        metadata={"kind": "subscription", "user_id": str(user.id), "capacity": str(plan.capacity)},
        subscription_data={
            "metadata": {"user_id": str(user.id), "capacity": str(plan.capacity)}
        },
        success_url=_front("/dashboard/billing?checkout=success"),
        cancel_url=_front("/dashboard/billing?checkout=cancel"),
    )
    return session.url


def create_billing_portal(customer_id: str) -> str:
    client = _client()
    session = client.billing_portal.Session.create(
        customer=customer_id,
        return_url=_front("/dashboard/billing"),
    )
    return session.url


def ensure_subscription_price(plan):
    """Cria Product + Price recorrente no Stripe para uma faixa, se ainda não existir."""
    client = _client()
    product = client.Product.create(name=f"Convida · Assinatura até {plan.capacity}")
    price = client.Price.create(
        product=product.id,
        currency=CURRENCY,
        unit_amount=subscription_price_cents(plan.capacity),
        recurring={"interval": "month"},
    )
    plan.stripe_price_id = price.id
    plan.save(update_fields=["stripe_price_id"])
    return price.id
