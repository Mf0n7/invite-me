from django.urls import path

from .views import (
    AdminBillingView,
    AdminEventDetailView,
    AdminEventsView,
    AdminOverviewView,
    AdminUsersView,
)

app_name = "administration"

urlpatterns = [
    path("admin/overview/", AdminOverviewView.as_view(), name="admin-overview"),
    path("admin/users/", AdminUsersView.as_view(), name="admin-users"),
    path("admin/billing/", AdminBillingView.as_view(), name="admin-billing"),
    path("admin/events/", AdminEventsView.as_view(), name="admin-events"),
    path("admin/events/<uuid:uuid>/", AdminEventDetailView.as_view(), name="admin-event-detail"),
]
