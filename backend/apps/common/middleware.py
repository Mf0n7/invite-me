"""Proteção anti-DDoS/flood por IP, aplicada antes de qualquer view.

Três camadas, todas por IP e todas configuráveis por variável de ambiente:

1. **Burst**   — pico curto (default 60 req / 10s). Pega automação agressiva sem
   incomodar quem navega rápido (uma página do SaaS dispara ~5-10 chamadas).
2. **Sustentada** — volume por minuto/hora (default 300/min e 3000/h).
3. **Concorrência** — nº máximo de requisições *simultâneas* do mesmo IP. Corta
   o cenário de abrir 200 conexões em paralelo para prender os workers do
   gunicorn.

Rotas sensíveis (login, registro, reset de senha, admin) têm um teto próprio,
bem mais baixo, somado ao global.

Isento: healthcheck e webhook do Stripe (autenticado por assinatura HMAC e com
retentativas legítimas em rajada).
"""
from __future__ import annotations

import logging

from django.conf import settings
from django.core.cache import cache
from django.http import JsonResponse

from .ratelimit import client_ip, hit

logger = logging.getLogger("convida.security")


def _too_many(retry_after: int, reason: str) -> JsonResponse:
    response = JsonResponse(
        {
            "detail": "Muitas requisições. Aguarde alguns instantes e tente novamente.",
            "code": "throttled",
        },
        status=429,
    )
    response["Retry-After"] = str(retry_after)
    response["X-RateLimit-Scope"] = reason
    return response


class IpRateLimitMiddleware:
    """Rate limit global por IP + limite de requisições concorrentes."""

    def __init__(self, get_response):
        self.get_response = get_response
        conf = settings.RATE_LIMIT
        self.enabled = conf["ENABLED"]
        self.exempt = tuple(conf["EXEMPT_PREFIXES"])
        self.sensitive = tuple(conf["SENSITIVE_PREFIXES"])
        self.rules = (
            ("burst", conf["BURST"], conf["BURST_WINDOW"]),
            ("minute", conf["PER_MINUTE"], 60),
            ("hour", conf["PER_HOUR"], 3600),
        )
        self.sensitive_rules = (
            ("auth_min", conf["SENSITIVE_PER_MINUTE"], 60),
            ("auth_hour", conf["SENSITIVE_PER_HOUR"], 3600),
        )
        self.max_concurrent = conf["MAX_CONCURRENT"]
        self.concurrency_ttl = conf["CONCURRENCY_TTL"]

    def __call__(self, request):
        if not self.enabled or request.path.startswith(self.exempt):
            return self.get_response(request)

        ip = client_ip(request)

        rules = self.rules
        if request.path.startswith(self.sensitive):
            rules = rules + self.sensitive_rules

        for name, limit, window in rules:
            allowed, retry_after = hit(f"ip:{name}:{ip}", limit, window)
            if not allowed:
                logger.warning(
                    "rate limit atingido ip=%s regra=%s path=%s", ip, name, request.path
                )
                return _too_many(retry_after, name)

        return self._with_concurrency_guard(request, ip)

    # ------------------------------------------------------------------ concorrência
    def _with_concurrency_guard(self, request, ip: str):
        if self.max_concurrent <= 0:
            return self.get_response(request)

        key = f"rlconc:{ip}"
        try:
            cache.add(key, 0, timeout=self.concurrency_ttl)
            in_flight = cache.incr(key)
        except Exception:  # noqa: BLE001 — cache fora do ar: segue sem o guard
            return self.get_response(request)

        if in_flight > self.max_concurrent:
            self._release(key)
            logger.warning("concorrência excedida ip=%s em_voo=%s", ip, in_flight)
            return _too_many(1, "concurrency")

        try:
            return self.get_response(request)
        finally:
            self._release(key)

    @staticmethod
    def _release(key: str) -> None:
        try:
            cache.decr(key)
        except Exception:  # noqa: BLE001 — chave pode ter expirado
            pass
