from rest_framework import serializers

from .models import GiftItem


class GiftItemSerializer(serializers.ModelSerializer):
    """Item como o dono vê/edita (inclui quem reservou)."""

    class Meta:
        model = GiftItem
        fields = [
            "id",
            "title",
            "description",
            "url",
            "status",
            "claimed_by_name",
            "claimed_at",
            "created_at",
        ]
        read_only_fields = ["id", "status", "claimed_by_name", "claimed_at", "created_at"]


class PublicGiftSerializer(serializers.ModelSerializer):
    """Item como o convidado vê — reservado fica visível porém indisponível, sem expor quem."""

    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = GiftItem
        fields = ["id", "title", "description", "url", "status", "is_available"]


class GiftClaimSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
