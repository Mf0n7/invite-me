from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Só o dono do objeto pode acessá-lo. Assume atributo `owner`."""

    message = "Você não tem permissão sobre este recurso."

    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, "owner", None)
        return owner is not None and owner == request.user
