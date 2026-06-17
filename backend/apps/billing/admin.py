from django.contrib import admin

from .models import EventPurchase, Subscription, SubscriptionPlan


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ["capacity", "amount_cents", "stripe_price_id", "active"]


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ["user", "capacity", "status", "current_period_end"]
    list_filter = ["status"]
    search_fields = ["user__email", "stripe_customer_id", "stripe_subscription_id"]


@admin.register(EventPurchase)
class EventPurchaseAdmin(admin.ModelAdmin):
    list_display = ["event", "capacity", "amount_cents", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["event__title", "stripe_session_id"]
