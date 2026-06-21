from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.entitlements import can_use_gift_list
from apps.events.models import Event, EventLink
from apps.invitations.models import Invitation

from .models import GiftItem
from .serializers import GiftClaimSerializer, GiftItemSerializer, PublicGiftSerializer


def resolve_event_by_token(token) -> Event:
    """Resolve o evento por um token de convite — genérico (link ativo) ou nominal."""
    link = EventLink.objects.filter(token=token, is_active=True).select_related("event").first()
    if link:
        return link.event
    invitation = Invitation.objects.filter(token=token).select_related("event").first()
    if invitation:
        return invitation.event
    return None


# --------------------------------------------------------------------- Dono


@extend_schema(tags=["Lista de presentes"])
class GiftListView(APIView):
    """Lista/cria presentes do evento (criar exige o addon de lista de presentes)."""

    permission_classes = [IsAuthenticated]
    serializer_class = GiftItemSerializer

    def _event(self, request, uuid):
        return get_object_or_404(Event, uuid=uuid, owner=request.user)

    def get(self, request, uuid):
        event = self._event(request, uuid)
        items = GiftItemSerializer(event.gifts.all(), many=True).data
        return Response({"entitled": can_use_gift_list(event), "items": items})

    def post(self, request, uuid):
        event = self._event(request, uuid)
        if not can_use_gift_list(event):
            return Response(
                {"detail": "Lista de presentes não liberada para este evento."},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )
        serializer = GiftItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(event=event)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(tags=["Lista de presentes"])
class GiftDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Editar/excluir um presente (dono)."""

    permission_classes = [IsAuthenticated]
    serializer_class = GiftItemSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return GiftItem.objects.none()
        return GiftItem.objects.filter(event__owner=self.request.user)


# ------------------------------------------------------------------ Público


@extend_schema(tags=["Lista de presentes"])
class PublicGiftListView(APIView):
    """Lista de presentes vista pelo convidado (via token de convite)."""

    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = PublicGiftSerializer

    def get(self, request, token):
        event = resolve_event_by_token(token)
        if not event:
            return Response({"detail": "Convite inválido."}, status=404)
        return Response(PublicGiftSerializer(event.gifts.all(), many=True).data)


@extend_schema(tags=["Lista de presentes"])
class GiftClaimView(APIView):
    """Convidado reserva um presente — fica indisponível para os demais."""

    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = GiftClaimSerializer

    def post(self, request, token, pk):
        event = resolve_event_by_token(token)
        if not event:
            return Response({"detail": "Convite inválido."}, status=404)
        gift = get_object_or_404(GiftItem, pk=pk, event=event)
        if not gift.is_available:
            return Response(
                {"detail": "Este presente já foi reservado."},
                status=status.HTTP_409_CONFLICT,
            )
        serializer = GiftClaimSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        gift.claim(serializer.validated_data["name"])
        return Response({"detail": "Presente reservado! Obrigado."}, status=200)
