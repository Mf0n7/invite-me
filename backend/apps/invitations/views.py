from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import generics, parsers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.events.models import Event
from apps.rsvps.models import Rsvp

from .imports import ImportError_, parse_guest_names
from .models import Invitation
from .serializers import (
    InvitationSerializer,
    NominalConfirmSerializer,
    PublicInvitationSerializer,
)


@extend_schema(tags=["Convites nominais"])
class EventInvitationListCreateView(generics.ListCreateAPIView):
    """Lista e cria convites nominais de um evento (apenas o dono)."""

    permission_classes = [IsAuthenticated]
    serializer_class = InvitationSerializer

    def _event(self):
        return get_object_or_404(Event, uuid=self.kwargs["uuid"], owner=self.request.user)

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Invitation.objects.none()
        return self._event().invitations.all()

    def perform_create(self, serializer):
        serializer.save(event=self._event())


@extend_schema(tags=["Convites nominais"])
class InvitationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Editar (nome) ou excluir um convite nominal."""

    permission_classes = [IsAuthenticated]
    serializer_class = InvitationSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Invitation.objects.none()
        return Invitation.objects.filter(event__owner=self.request.user)


@extend_schema(tags=["Convites nominais"])
class InvitationImportView(APIView):
    """Importa nomes de uma planilha (.csv/.xlsx) e gera os convites."""

    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request, uuid):
        event = get_object_or_404(Event, uuid=uuid, owner=request.user)
        uploaded = request.FILES.get("file")
        if not uploaded:
            return Response({"detail": "Envie um arquivo no campo 'file'."}, status=400)
        try:
            names = parse_guest_names(uploaded)
        except ImportError_ as exc:
            return Response({"detail": str(exc)}, status=400)

        if not names:
            return Response({"detail": "Nenhum nome encontrado na planilha."}, status=400)

        invitations = [Invitation(event=event, guest_name=n) for n in names]
        Invitation.objects.bulk_create(invitations)
        return Response({"created": len(invitations), "names": names}, status=201)


@extend_schema(tags=["Convites nominais"])
class PublicNominalView(APIView):
    """Página pública do convite nominal."""

    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = PublicInvitationSerializer

    def get(self, request, token):
        invitation = get_object_or_404(Invitation, token=token)
        return Response(
            PublicInvitationSerializer(invitation, context={"request": request}).data
        )


@extend_schema(tags=["Convites nominais"])
class NominalConfirmView(APIView):
    """Confirmação nominal de uso único."""

    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = NominalConfirmSerializer

    def post(self, request, token):
        invitation = get_object_or_404(Invitation, token=token)
        if invitation.is_confirmed:
            return Response(
                {"detail": "Este convite já foi confirmado."},
                status=status.HTTP_409_CONFLICT,
            )
        serializer = NominalConfirmSerializer(
            data=request.data, context={"event": invitation.event}
        )
        serializer.is_valid(raise_exception=True)
        Rsvp.objects.create(
            event=invitation.event,
            invitation=invitation,
            name=invitation.guest_name,
            companion_names=serializer.validated_data["companion_names"],
        )
        invitation.mark_confirmed()
        return Response(
            {"detail": "Presença confirmada!", "name": invitation.guest_name},
            status=status.HTTP_201_CREATED,
        )
