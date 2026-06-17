from django.conf import settings
from rest_framework import serializers

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
