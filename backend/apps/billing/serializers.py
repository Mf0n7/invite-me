from rest_framework import serializers

from .models import Subscription


class TierSerializer(serializers.Serializer):
    capacity = serializers.IntegerField()
    amount_cents = serializers.IntegerField()


class CheckoutRequestSerializer(serializers.Serializer):
    capacity = serializers.IntegerField()


class SubscriptionSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Subscription
        fields = ["capacity", "status", "current_period_end", "is_active"]
