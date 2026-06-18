from django.shortcuts import get_object_or_404
from rest_framework import parsers, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsOwner

from .emails import send_event_created_email
from .models import Event
from .serializers import EventLinkSerializer, EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    """CRUD de eventos. Cada usuário só enxerga e gerencia os próprios."""

    serializer_class = EventSerializer
    permission_classes = [IsOwner]
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]
    lookup_field = "uuid"

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Event.objects.none()
        return Event.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        event = serializer.save(owner=self.request.user)
        send_event_created_email(event)


class EventLinkView(APIView):
    """Link público de convite do evento. GET retorna/garante o ativo; POST regenera."""

    permission_classes = [IsAuthenticated]
    serializer_class = EventLinkSerializer

    def _get_event(self, request, uuid):
        return get_object_or_404(Event, uuid=uuid, owner=request.user)

    def get(self, request, uuid):
        link = self._get_event(request, uuid).ensure_link()
        return Response(EventLinkSerializer(link).data)

    def post(self, request, uuid):
        link = self._get_event(request, uuid).regenerate_link()
        return Response(EventLinkSerializer(link).data, status=status.HTTP_201_CREATED)
