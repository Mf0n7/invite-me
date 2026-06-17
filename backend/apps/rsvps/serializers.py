from rest_framework import serializers

from apps.events.models import Event

from .models import Rsvp


class PublicEventSerializer(serializers.ModelSerializer):
    """Dados do evento expostos na página pública de convite (sem dados do dono)."""

    class Meta:
        model = Event
        fields = [
            "uuid",
            "title",
            "description",
            "photo",
            "address",
            "location_link",
            "starts_at",
            "note",
            "allow_companions",
            "max_companions",
        ]


class ConfirmSerializer(serializers.ModelSerializer):
    companion_names = serializers.ListField(
        child=serializers.CharField(max_length=120, allow_blank=False, trim_whitespace=True),
        required=False,
        default=list,
    )

    class Meta:
        model = Rsvp
        fields = ["name", "companion_names"]

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


class RsvpSerializer(serializers.ModelSerializer):
    """Confirmação como o dono vê (nomes incluídos)."""

    total_people = serializers.IntegerField(read_only=True)

    class Meta:
        model = Rsvp
        fields = ["id", "name", "companion_names", "companions_count", "total_people", "created_at"]


class RsvpSummarySerializer(serializers.Serializer):
    """Resumo de contagem — sempre gratuito, sem teto."""

    confirmations = serializers.IntegerField()
    total_guests = serializers.IntegerField()
