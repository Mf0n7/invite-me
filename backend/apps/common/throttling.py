"""Throttles do DRF usados nas rotas de autenticação e nas rotas públicas.

O `NUM_PROXIES=1` em REST_FRAMEWORK faz o DRF resolver o IP real a partir do
X-Forwarded-For contando da direita para a esquerda — mesma regra do
`apps.common.ratelimit.client_ip`.
"""
from __future__ import annotations

import logging

from rest_framework.throttling import (
    AnonRateThrottle,
    BaseThrottle,
    ScopedRateThrottle,
    UserRateThrottle,
)

from .ratelimit import clear, digest, flag_clear, flag_get, flag_set, hit

logger = logging.getLogger("convida.security")


# ------------------------------------------------------------------ padrões globais
class BurstAnonThrottle(AnonRateThrottle):
    scope = "anon_burst"


class SustainedAnonThrottle(AnonRateThrottle):
    scope = "anon_sustained"


class BurstUserThrottle(UserRateThrottle):
    scope = "user_burst"


class SustainedUserThrottle(UserRateThrottle):
    scope = "user_sustained"


# ------------------------------------------------------------------ escopos por view
class ScopedThrottle(ScopedRateThrottle):
    """Lê o escopo em `throttle_scope` (janela curta)."""


class ScopedSustainedThrottle(ScopedRateThrottle):
    """Segunda janela, mais longa, lida em `throttle_scope_sustained`."""

    scope_attr = "throttle_scope_sustained"


# ------------------------------------------------------------------ anti-bruteforce
class LoginBruteForceThrottle(BaseThrottle):
    """Limita tentativas de login por (IP + e-mail alvo), com escalonamento.

    Regra de negócio:

    * até **10 tentativas por minuto** para o par (IP, e-mail);
    * ao estourar esse teto, o par entra em **modo estrito** por
      ``STRICT_TTL`` — enquanto estiver estrito, só **5 tentativas por minuto**.
      Persistir no erro após o primeiro bloqueio caracteriza força bruta, então
      a janela seguinte é metade da original.

    A contagem é de tentativas *falhas*: a view chama :meth:`reset` quando o
    login dá certo, zerando a janela e o modo estrito daquele par.
    """

    NORMAL_LIMIT = 10
    STRICT_LIMIT = 5
    WINDOW = 60
    STRICT_TTL = 15 * 60  # quanto tempo o par (IP, e-mail) fica sob suspeita

    def __init__(self):
        self._wait = self.WINDOW

    # -- chaves ---------------------------------------------------------
    @classmethod
    def _email_of(cls, request) -> str:
        data = getattr(request, "data", None)
        email = ""
        if isinstance(data, dict):
            email = str(data.get("email") or "")
        return email.strip().lower() or "-"

    @classmethod
    def _keys(cls, ident: str, email: str) -> tuple[str, str]:
        base = f"login:{ident}:{digest(email)}"
        return base, f"{base}:strict"

    # -- API do DRF -----------------------------------------------------
    def allow_request(self, request, view):
        ident = self.get_ident(request)
        email = self._email_of(request)
        window_key, strict_key = self._keys(ident, email)

        strict = flag_get(strict_key)
        limit = self.STRICT_LIMIT if strict else self.NORMAL_LIMIT

        allowed, retry_after = hit(window_key, limit, self.WINDOW)
        if not allowed:
            # Primeiro bloqueio já promove o par a "estrito"; bloqueios
            # seguintes renovam o prazo enquanto o ataque continuar.
            flag_set(strict_key, self.STRICT_TTL)
            self._wait = retry_after
            logger.warning(
                "bruteforce de login bloqueado ip=%s email_hash=%s estrito=%s limite=%s",
                ident,
                digest(email),
                strict,
                limit,
            )
            return False
        return True

    def wait(self):
        return self._wait

    # -- usado pela view em caso de sucesso ------------------------------
    @classmethod
    def reset(cls, request) -> None:
        ident = BaseThrottle().get_ident(request)
        window_key, strict_key = cls._keys(ident, cls._email_of(request))
        clear(window_key)
        flag_clear(strict_key)


class LoginIpThrottle(AnonRateThrottle):
    """Teto por IP independente do e-mail — barra *password spraying*.

    (tentar uma senha comum contra centenas de e-mails diferentes, o que
    escaparia do limite por par IP+e-mail.)
    """

    scope = "login_ip"
