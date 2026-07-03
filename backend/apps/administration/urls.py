from django.urls import path

from .views import AdminBillingView, AdminOverviewView, AdminUsersView

app_name = "administration"

urlpatterns = [
    path("admin/overview/", AdminOverviewView.as_view(), name="admin-overview"),
    path("admin/users/", AdminUsersView.as_view(), name="admin-users"),
    path("admin/billing/", AdminBillingView.as_view(), name="admin-billing"),
]
