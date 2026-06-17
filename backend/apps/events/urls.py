from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import EventLinkView, EventViewSet

app_name = "events"

router = DefaultRouter()
router.register("events", EventViewSet, basename="event")

urlpatterns = [
    path("events/<uuid:uuid>/link/", EventLinkView.as_view(), name="event-link"),
    *router.urls,
]
