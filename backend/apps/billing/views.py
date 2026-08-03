import stripe
from django.conf import settings
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.throttling import ScopedThrottle
from apps.events.models import Event

from .constants import (
    FREE_CAPACITY,
    GIFT_ADDON_PRICE_CENTS,
    PAID_TIERS,
    event_price_cents,
    price_cents,
    subscription_price_cents,
)
from .models import EventPurchase, Subscription, SubscriptionPlan
from .serializers import SubscriptionSerializer
from .services import (
    create_billing_portal,
    create_event_checkout,
    create_subscription_checkout,
    stripe_enabled,
)
from .webhooks import handle_event


@extend_schema(tags=["Pagamentos & Assinatura"])
class TiersView(APIView):
    """Faixas e preços disponíveis (avulso e assinatura)."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedThrottle]
    throttle_scope = "public_read"

    def get(self, request):
        tiers = [
            {
                "capacity": c,
                "event_cents": event_price_cents(c),
                "subscription_cents": subscription_price_cents(c),
            }
            for c in PAID_TIERS
        ]
        return Response(
            {
                "free_capacity": FREE_CAPACITY,
                "currency": "brl",
                "tiers": tiers,
                "gift_addon_cents": GIFT_ADDON_PRICE_CENTS,
            }
        )


def _require_stripe():
    if not stripe_enabled():
        return Response(
            {"detail": "Pagamentos ainda não configurados (defina STRIPE_SECRET_KEY)."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    return None


def _capacity_from(request) -> int:
    """Lê `capacity` do corpo sem estourar 500 quando vem lixo ("abc", lista, null)."""
    try:
        return int(request.data.get("capacity") or 0)
    except (TypeError, ValueError):
        return 0


@extend_schema(tags=["Pagamentos & Assinatura"])
class EventCheckoutView(APIView):
    """Checkout avulso de uma faixa para um evento."""

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedThrottle]
    throttle_scope = "checkout"

    def post(self, request, uuid):
        if (resp := _require_stripe()) is not None:
            return resp
        capacity = _capacity_from(request)
        if capacity not in PAID_TIERS:
            return Response({"detail": "Faixa inválida."}, status=400)
        event = get_object_or_404(Event, uuid=uuid, owner=request.user)
        purchase = EventPurchase.objects.create(
            event=event, capacity=capacity, amount_cents=price_cents(capacity)
        )
        try:
            url = create_event_checkout(purchase)
        except stripe.error.StripeError as exc:
            return Response({"detail": str(exc)}, status=502)
        return Response({"checkout_url": url})


@extend_schema(tags=["Pagamentos & Assinatura"])
class GiftCheckoutView(APIView):
    """Checkout do addon de lista de presentes (avulso por evento)."""

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedThrottle]
    throttle_scope = "checkout"

    def post(self, request, uuid):
        if (resp := _require_stripe()) is not None:
            return resp
        event = get_object_or_404(Event, uuid=uuid, owner=request.user)
        purchase = EventPurchase.objects.create(
            event=event,
            kind=EventPurchase.Kind.GIFT,
            capacity=0,
            amount_cents=GIFT_ADDON_PRICE_CENTS,
        )
        try:
            url = create_event_checkout(purchase)
        except stripe.error.StripeError as exc:
            return Response({"detail": str(exc)}, status=502)
        return Response({"checkout_url": url})


@extend_schema(tags=["Pagamentos & Assinatura"])
class SubscriptionCheckoutView(APIView):
    """Checkout de assinatura recorrente por faixa."""

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedThrottle]
    throttle_scope = "checkout"

    def post(self, request):
        if (resp := _require_stripe()) is not None:
            return resp
        capacity = _capacity_from(request)
        plan = SubscriptionPlan.objects.filter(capacity=capacity, active=True).first()
        if not plan or not plan.stripe_price_id:
            return Response(
                {"detail": "Faixa de assinatura indisponível. Rode 'manage.py seed_stripe'."},
                status=400,
            )
        try:
            url = create_subscription_checkout(request.user, plan)
        except stripe.error.StripeError as exc:
            return Response({"detail": str(exc)}, status=502)
        return Response({"checkout_url": url})


@extend_schema(tags=["Pagamentos & Assinatura"])
class SubscriptionView(APIView):
    """Status da assinatura do usuário atual."""

    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionSerializer

    def get(self, request):
        sub = Subscription.objects.filter(user=request.user).first()
        if not sub:
            return Response(None)
        return Response(SubscriptionSerializer(sub).data)


@extend_schema(tags=["Pagamentos & Assinatura"])
class PortalView(APIView):
    """Link do portal de gerenciamento (cancelar/atualizar) do Stripe."""

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedThrottle]
    throttle_scope = "checkout"

    def post(self, request):
        if (resp := _require_stripe()) is not None:
            return resp
        sub = Subscription.objects.filter(user=request.user).first()
        if not sub or not sub.stripe_customer_id:
            return Response({"detail": "Nenhuma assinatura para gerenciar."}, status=400)
        try:
            url = create_billing_portal(sub.stripe_customer_id)
        except stripe.error.StripeError as exc:
            return Response({"detail": str(exc)}, status=502)
        return Response({"portal_url": url})


@extend_schema(tags=["Pagamentos & Assinatura"])
class WebhookView(APIView):
    """Recebe eventos do Stripe (valida assinatura)."""

    permission_classes = [AllowAny]
    authentication_classes = []
    # Sem throttle: a autenticação é a assinatura HMAC do Stripe e as
    # retentativas legítimas chegam em rajada. A rota também está na lista de
    # isenção do middleware (settings.RATE_LIMIT["EXEMPT_PREFIXES"]).
    throttle_classes = []

    def post(self, request):
        if not settings.STRIPE_WEBHOOK_SECRET:
            # Sem segredo configurado, construct_event aceitaria qualquer coisa.
            return Response(status=503)
        payload = request.body
        sig = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        try:
            event = stripe.Webhook.construct_event(payload, sig, settings.STRIPE_WEBHOOK_SECRET)
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=400)
        handle_event(event)
        return Response(status=200)
