from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.common.validators import validate_image_upload, validate_safe_url

from .models import Event, EventLink


class EventLinkSerializer(serializers.ModelSerializer):
    public_url = serializers.SerializerMethodField()

    class Meta:
        model = EventLink
        fields = ["token", "is_active", "created_at", "public_url"]

    def get_public_url(self, obj) -> str:
        return f"{settings.FRONTEND_URL}/invite/{obj.token}"


class EventSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Event
        fields = [
            "id",
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
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "uuid", "created_at", "updated_at"]

    def validate_photo(self, value):
        """Rejeita o arquivo com 400 antes de chegar ao model (que devolveria 500).

        A checagem real (formato, tamanho, bomba de descompressão) vive em
        apps.common.validators e roda de novo no save() — a validação de
        verdade é a do model, esta aqui só melhora a resposta de erro.
        """
        if value is None:
            return value
        try:
            validate_image_upload(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages) from exc
        return value

    def validate_location_link(self, value):
        try:
            return validate_safe_url(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages) from exc

    def validate(self, attrs):
        allow = attrs.get(
            "allow_companions",
            getattr(self.instance, "allow_companions", False),
        )
        max_comp = attrs.get(
            "max_companions",
            getattr(self.instance, "max_companions", 0),
        )
        if allow and max_comp < 1:
            raise serializers.ValidationError(
                {"max_companions": "Defina ao menos 1 acompanhante quando permitido."}
            )
        return attrs
