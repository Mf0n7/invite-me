from django.urls import path

from .views import ConfirmView, PublicEventView, RsvpListView, RsvpSummaryView

app_name = "rsvps"

urlpatterns = [
    # Dono
    path("events/<uuid:uuid>/rsvps/summary/", RsvpSummaryView.as_view(), name="rsvp-summary"),
    path("events/<uuid:uuid>/rsvps/", RsvpListView.as_view(), name="rsvp-list"),
    # Público
    path("invite/<uuid:token>/", PublicEventView.as_view(), name="public-event"),
    path("invite/<uuid:token>/confirm/", ConfirmView.as_view(), name="public-confirm"),
]
