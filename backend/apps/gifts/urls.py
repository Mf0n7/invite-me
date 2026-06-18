from django.urls import path

from .views import GiftClaimView, GiftDetailView, GiftListView, PublicGiftListView

app_name = "gifts"

urlpatterns = [
    # Dono
    path("events/<uuid:uuid>/gifts/", GiftListView.as_view(), name="event-gifts"),
    path("gifts/<int:pk>/", GiftDetailView.as_view(), name="gift-detail"),
    # Público (token de convite genérico ou nominal)
    path("public/<uuid:token>/gifts/", PublicGiftListView.as_view(), name="public-gifts"),
    path(
        "public/<uuid:token>/gifts/<int:pk>/claim/",
        GiftClaimView.as_view(),
        name="public-gift-claim",
    ),
]
