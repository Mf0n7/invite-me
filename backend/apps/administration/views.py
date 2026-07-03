"""Endpoints de administração (painel de superusuário/staff).

Só para usuários com is_staff=True (IsAdminUser). Agregações de faturamento,
usuários e visão geral — formato pensado para o painel /admin do frontend.
"""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Q, Sum
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.constants import plan_name
from apps.billing.models import EventPurchase, Subscription, SubscriptionPlan

User = get_user_model()

RECENT_PAYMENTS_LIMIT = 10


def active_subscriptions():
    """Assinaturas vigentes: status ativo/trial e período ainda válido."""
    now = timezone.now()
    return Subscription.objects.filter(
        status__in=[Subscription.Status.ACTIVE, Subscription.Status.TRIALING]
    ).filter(Q(current_period_end__isnull=True) | Q(current_period_end__gte=now))


def _plans_by_capacity():
    return {p.capacity: p for p in SubscriptionPlan.objects.all()}


def _amount_for(capacity: int, plans: dict) -> int:
    plan = plans.get(capacity)
    return plan.amount_cents if plan else 0


def _label_for(capacity: int, plans: dict) -> str:
    plan = plans.get(capacity)
    if plan and plan.name:
        return plan.name
    return plan_name(capacity)


@extend_schema(tags=["Administração"])
class AdminOverviewView(APIView):
    """Visão geral: MRR, assinaturas ativas, usuários e quebra por plano."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        plans = _plans_by_capacity()
        subs = list(active_subscriptions())

        mrr_cents = sum(_amount_for(s.capacity, plans) for s in subs)

        breakdown = {}
        for s in subs:
            row = breakdown.setdefault(
                s.capacity,
                {"name": _label_for(s.capacity, plans), "subscribers": 0, "mrr_cents": 0},
            )
            row["subscribers"] += 1
            row["mrr_cents"] += _amount_for(s.capacity, plans)
        plan_breakdown = [breakdown[c] for c in sorted(breakdown)]

        since = timezone.now() - timedelta(days=30)
        return Response(
            {
                "mrr_cents": mrr_cents,
                "active_subscriptions": len(subs),
                "active_users_30d": User.objects.filter(last_login__gte=since).count(),
                "new_users_30d": User.objects.filter(date_joined__gte=since).count(),
                "plan_breakdown": plan_breakdown,
            }
        )


@extend_schema(tags=["Administração"])
class AdminUsersView(APIView):
    """Lista todos os usuários (array puro) com plano e status."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        plans = _plans_by_capacity()
        sub_by_user = {s.user_id: s for s in active_subscriptions()}

        data = []
        for u in User.objects.all().order_by("-date_joined"):
            sub = sub_by_user.get(u.id)
            data.append(
                {
                    "id": u.id,
                    "full_name": u.full_name,
                    "email": u.email,
                    "plan": _label_for(sub.capacity, plans) if sub else None,
                    "status": "ativo" if u.is_active else "inativo",
                    "date_joined": u.date_joined,
                }
            )
        return Response(data)


@extend_schema(tags=["Administração"])
class AdminBillingView(APIView):
    """Faturamento: receita recorrente, compras avulsas e pagamentos recentes."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        plans = _plans_by_capacity()

        mrr_cents = sum(_amount_for(s.capacity, plans) for s in active_subscriptions())

        paid = EventPurchase.objects.filter(status=EventPurchase.Status.PAID)
        event_purchases_cents = paid.aggregate(total=Sum("amount_cents"))["total"] or 0

        recent = (
            paid.select_related("event", "event__owner")
            .order_by("-created_at")[:RECENT_PAYMENTS_LIMIT]
        )
        recent_payments = [
            {
                "id": p.id,
                "user": p.event.owner.get_display_name(),
                "plan": (
                    "Lista de presentes"
                    if p.kind == EventPurchase.Kind.GIFT
                    else _label_for(p.capacity, plans)
                ),
                "amount_cents": p.amount_cents,
                "created_at": p.created_at,
            }
            for p in recent
        ]

        return Response(
            {
                "monthly_revenue_cents": mrr_cents,
                "event_purchases_cents": event_purchases_cents,
                "recent_payments": recent_payments,
            }
        )
