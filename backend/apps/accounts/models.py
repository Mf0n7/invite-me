from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from .managers import UserManager


class User(AbstractUser):
    """Usuário com login por e-mail (campo username removido)."""

    username = None
    email = models.EmailField(_("e-mail"), unique=True)
    full_name = models.CharField(_("nome completo"), max_length=150, blank=True)
    avatar_url = models.URLField(_("avatar"), blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = _("usuário")
        verbose_name_plural = _("usuários")

    def __str__(self):
        return self.email

    def get_display_name(self):
        return self.full_name or self.email.split("@")[0]
