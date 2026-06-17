from django.db.models import Count, Sum
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.entitlements import name_capacity_for_event
from apps.events.models import Event, EventLink

from .serializers import (
    ConfirmSerializer,
    PublicEventSerializer,
    RsvpSummarySerializer,
)


def _summary(event: Event) -> dict:
    agg = event.rsvps.aggregate(confirmations=Count("id"), companions=Sum("companions_count"))
    confirmations = agg["confirmations"] or 0
    companions = agg["companions"] or 0
    return {"confirmations": confirmations, "total_guests": confirmations + companions}


class RsvpSummaryView(APIView):
    """Resumo de confirmados para o dono — contagem sempre liberada, sem teto."""

    permission_classes = [IsAuthenticated]
    serializer_class = RsvpSummarySerializer

    def get(self, request, uuid):
        event = get_object_or_404(Event, uuid=uuid, owner=request.user)
        return Response(RsvpSummarySerializer(_summary(event)).data)


class RsvpListView(APIView):
    """Lista de confirmados para o dono, com gating de nomes por faixa.

    A contagem é sempre total; os NOMES são revelados até a capacidade liberada,
    cortando por PESSOAS (convidado + acompanhantes contam), na ordem de chegada.
    Cada pessoa vira um item; acompanhantes ficam agrupados sob o convidado.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, uuid):
        event = get_object_or_404(Event, uuid=uuid, owner=request.user)
        capacity = name_capacity_for_event(event)
        ordered = event.rsvps.all().order_by("created_at")

        # Achata em pessoas, na ordem de chegada: convidado primeiro, depois acompanhantes.
        people = []
        for rsvp in ordered:
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

        total_people = len(people)
        revealed = people[:capacity]
        hidden = max(0, total_people - capacity)

        return Response(
            {
                "total_confirmations": ordered.count(),
                "total_guests": total_people,
                "name_capacity": capacity,
                "revealed_people": revealed,
                "hidden_count": hidden,
                "is_limited": hidden > 0,
            }
        )


class PublicEventView(APIView):
    """Página pública do convite — resolve o evento pelo token do link ativo."""

    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = PublicEventSerializer

    def get(self, request, token):
        link = get_object_or_404(EventLink, token=token, is_active=True)
        return Response(PublicEventSerializer(link.event, context={"request": request}).data)


class ConfirmView(APIView):
    """Confirmação de presença via link público (sem autenticação)."""

    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = ConfirmSerializer

    def post(self, request, token):
        link = get_object_or_404(EventLink, token=token, is_active=True)
        serializer = ConfirmSerializer(data=request.data, context={"event": link.event})
        serializer.is_valid(raise_exception=True)
        serializer.save(event=link.event, link=link)
        return Response(
            {"detail": "Presença confirmada!", "name": serializer.validated_data["name"]},
            status=status.HTTP_201_CREATED,
        )
