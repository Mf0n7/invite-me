from django.urls import path

from .views import (
    EventInvitationListCreateView,
    InvitationDetailView,
    InvitationImportView,
    NominalConfirmView,
    PublicNominalView,
)

app_name = "invitations"

urlpatterns = [
    # Dono
    path(
        "events/<uuid:uuid>/invitations/",
        EventInvitationListCreateView.as_view(),
        name="event-invitations",
    ),
    path(
        "events/<uuid:uuid>/invitations/import/",
        InvitationImportView.as_view(),
        name="invitations-import",
    ),
    path("invitations/<int:pk>/", InvitationDetailView.as_view(), name="invitation-detail"),
    # Público (nominal)
    path("nominal/<uuid:token>/", PublicNominalView.as_view(), name="public-nominal"),
    path("nominal/<uuid:token>/confirm/", NominalConfirmView.as_view(), name="nominal-confirm"),
]
