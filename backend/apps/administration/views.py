"""Endpoints de administração (painel de superusuário/staff).

Só para usuários com is_staff=True (IsAdminUser). Agregações de faturamento,
usuários e visão geral — formato pensado para o painel /admin do frontend.
"""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.constants import plan_name
from apps.billing.models import EventPurchase, Subscription, SubscriptionPlan
from apps.events.models import Event
from apps.gifts.models import GiftItem
from apps.rsvps.models import Rsvp

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


def _rsvp_stats_by_event() -> dict:
    """Confirmações e acompanhantes por evento, numa única query agregada."""
    rows = Rsvp.objects.values("event_id").annotate(
        confirmations=Count("id"), companions=Sum("companions_count")
    )
    return {r["event_id"]: r for r in rows}


def _gift_counts_by_event() -> dict:
    rows = GiftItem.objects.values("event_id").annotate(count=Count("id"))
    return {r["event_id"]: r["count"] for r in rows}


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
                    "avatar_url": u.avatar_url,
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


@extend_schema(tags=["Administração"])
class AdminEventsView(APIView):
    """Lista todos os eventos da plataforma (array puro), com dono e confirmações."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        stats = _rsvp_stats_by_event()
        gift_counts = _gift_counts_by_event()

        data = []
        for e in Event.objects.select_related("owner").order_by("-created_at"):
            stat = stats.get(e.id, {})
            confirmations = stat.get("confirmations") or 0
            companions = stat.get("companions") or 0
            data.append(
                {
                    "id": e.id,
                    "uuid": e.uuid,
                    "title": e.title,
                    "starts_at": e.starts_at,
                    "address": e.address,
                    "owner_name": e.owner.get_display_name(),
                    "owner_email": e.owner.email,
                    "confirmations": confirmations,
                    "total_guests": confirmations + companions,
                    "gifts_count": gift_counts.get(e.id, 0),
                    "created_at": e.created_at,
                    "updated_at": e.updated_at,
                }
            )
        return Response(data)


@extend_schema(tags=["Administração"])
class AdminEventDetailView(APIView):
    """Dados completos de um evento: dono, confirmados, convites, presentes e compras."""

    permission_classes = [IsAdminUser]

    def get(self, request, uuid):
        event = get_object_or_404(Event.objects.select_related("owner"), uuid=uuid)

        # Achata em pessoas, na ordem de chegada: convidado primeiro, depois acompanhantes.
        people = []
        for rsvp in event.rsvps.all().order_by("created_at"):
            people.append(
                {"rsvp_id": rsvp.id, "name": rsvp.name, "is_companion": False, "group_name": rsvp.name}
            )
            for companion in rsvp.companion_names or []:
                people.append(
                    {
                        "rsvp_id": rsvp.id,
                        "name": companion,
                        "is_companion": True,
                        "group_name": rsvp.name,
                    }
                )

        invitations = [
            {
                "id": i.id,
                "guest_name": i.guest_name,
                "status": i.status,
                "confirmed_at": i.confirmed_at,
                "created_at": i.created_at,
            }
            for i in event.invitations.all()
        ]
        gifts = [
            {
                "id": g.id,
                "title": g.title,
                "status": g.status,
                "claimed_by_name": g.claimed_by_name,
                "claimed_at": g.claimed_at,
                "created_at": g.created_at,
            }
            for g in event.gifts.all()
        ]
        purchases = [
            {
                "id": p.id,
                "kind": p.kind,
                "capacity": p.capacity,
                "amount_cents": p.amount_cents,
                "status": p.status,
                "created_at": p.created_at,
            }
            for p in event.purchases.all()
        ]

        return Response(
            {
                "id": event.id,
                "uuid": event.uuid,
                "title": event.title,
                "description": event.description,
                "photo": event.photo.url if event.photo else None,
                "address": event.address,
                "location_link": event.location_link,
                "starts_at": event.starts_at,
                "note": event.note,
                "allow_companions": event.allow_companions,
                "max_companions": event.max_companions,
                "created_at": event.created_at,
                "updated_at": event.updated_at,
                "owner": {
                    "id": event.owner.id,
                    "full_name": event.owner.get_display_name(),
                    "email": event.owner.email,
                    "avatar_url": event.owner.avatar_url,
                },
                "confirmations": event.rsvps.count(),
                "total_guests": len(people),
                "attendees": people,
                "invitations": invitations,
                "gifts": gifts,
                "purchases": purchases,
            }
        )
