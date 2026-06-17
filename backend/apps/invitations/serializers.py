from django.conf import settings
from rest_framework import serializers

from apps.events.models import Event
from apps.rsvps.serializers import PublicEventSerializer

from .models import Invitation


class InvitationSerializer(serializers.ModelSerializer):
    """Convite como o dono vê/edita. Só o nome é editável."""

    public_url = serializers.SerializerMethodField()

    class Meta:
        model = Invitation
        fields = [
            "id",
            "guest_name",
            "token",
            "status",
            "confirmed_at",
            "created_at",
            "public_url",
        ]
        read_only_fields = ["id", "token", "status", "confirmed_at", "created_at"]

    def get_public_url(self, obj) -> str:
        return f"{settings.FRONTEND_URL}/convite/{obj.token}"


class PublicInvitationSerializer(serializers.Serializer):
    """O que o convidado vê na página nominal."""

    guest_name = serializers.CharField()
    status = serializers.CharField()
    event = PublicEventSerializer()


class NominalConfirmSerializer(serializers.Serializer):
    """Confirmação nominal: o nome é fixo (do convite); só os acompanhantes vêm aqui."""

    companion_names = serializers.ListField(
        child=serializers.CharField(max_length=120, allow_blank=False, trim_whitespace=True),
        required=False,
        default=list,
    )

    def validate_companion_names(self, value):
        return [n.strip() for n in value if n and n.strip()]

    def validate(self, attrs):
        event: Event = self.context["event"]
        names = attrs.get("companion_names", [])
        if not event.allow_companions and names:
            raise serializers.ValidationError(
                {"companion_names": "Este evento não permite acompanhantes."}
            )
        if len(names) > event.max_companions:
            raise serializers.ValidationError(
                {"companion_names": f"Máximo de {event.max_companions} acompanhante(s)."}
            )
        return attrs
