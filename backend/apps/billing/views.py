import stripe
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.events.models import Event

from .constants import FREE_CAPACITY, PAID_TIERS, price_cents
from .models import EventPurchase, Subscription, SubscriptionPlan
from .serializers import SubscriptionSerializer
from .services import (
    create_billing_portal,
    create_event_checkout,
    create_subscription_checkout,
    stripe_enabled,
)
from .webhooks import handle_event


class TiersView(APIView):
    """Faixas e preços disponíveis (avulso e assinatura)."""

    permission_classes = [AllowAny]

    def get(self, request):
        tiers = [{"capacity": c, "amount_cents": price_cents(c)} for c in PAID_TIERS]
        return Response({"free_capacity": FREE_CAPACITY, "currency": "brl", "tiers": tiers})


def _require_stripe():
    if not stripe_enabled():
        return Response(
            {"detail": "Pagamentos ainda não configurados (defina STRIPE_SECRET_KEY)."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    return None


class EventCheckoutView(APIView):
    """Checkout avulso de uma faixa para um evento."""

    permission_classes = [IsAuthenticated]

    def post(self, request, uuid):
        if (resp := _require_stripe()) is not None:
            return resp
        capacity = int(request.data.get("capacity", 0) or 0)
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


class SubscriptionCheckoutView(APIView):
    """Checkout de assinatura recorrente por faixa."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if (resp := _require_stripe()) is not None:
            return resp
        capacity = int(request.data.get("capacity", 0) or 0)
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


class SubscriptionView(APIView):
    """Status da assinatura do usuário atual."""

    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionSerializer

    def get(self, request):
        sub = Subscription.objects.filter(user=request.user).first()
        if not sub:
            return Response(None)
        return Response(SubscriptionSerializer(sub).data)


class PortalView(APIView):
    """Link do portal de gerenciamento (cancelar/atualizar) do Stripe."""

    permission_classes = [IsAuthenticated]

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


class WebhookView(APIView):
    """Recebe eventos do Stripe (valida assinatura)."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        try:
            event = stripe.Webhook.construct_event(payload, sig, settings.STRIPE_WEBHOOK_SECRET)
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=400)
        handle_event(event)
        return Response(status=200)
