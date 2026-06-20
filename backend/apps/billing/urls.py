from django.urls import path

from .views import (
    EventCheckoutView,
    GiftCheckoutView,
    PortalView,
    SubscriptionCheckoutView,
    SubscriptionView,
    TiersView,
    WebhookView,
)

app_name = "billing"

urlpatterns = [
    path("billing/tiers/", TiersView.as_view(), name="tiers"),
    path("billing/events/<uuid:uuid>/checkout/", EventCheckoutView.as_view(), name="event-checkout"),
    path(
        "billing/events/<uuid:uuid>/gift-checkout/",
        GiftCheckoutView.as_view(),
        name="gift-checkout",
    ),
    path("billing/subscription/", SubscriptionView.as_view(), name="subscription"),
    path(
        "billing/subscription/checkout/",
        SubscriptionCheckoutView.as_view(),
        name="subscription-checkout",
    ),
    path("billing/portal/", PortalView.as_view(), name="portal"),
    path("billing/webhook/", WebhookView.as_view(), name="webhook"),
]
