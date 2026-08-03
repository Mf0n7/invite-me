"""Primitivas de rate limiting sobre o cache (Redis em produção).

Janela deslizante simples: guardamos os timestamps dos hits recentes de uma
chave e descartamos os que saíram da janela. É o mesmo modelo usado pelo DRF,
com duas diferenças importantes:

* **fail-open** — se o cache (Redis) estiver fora do ar, a requisição PASSA e o
  incidente é logado. Um Redis indisponível não pode derrubar o site inteiro.
* **IP real atrás de proxy** — o Coolify/Traefik termina o TLS e repassa o IP
  do cliente em ``X-Forwarded-For``. Como o cabeçalho é forjável pelo cliente,
  contamos da direita para a esquerda (``TRUSTED_PROXY_COUNT`` saltos), que é a
  única parte que o próprio proxy escreveu.
"""
from __future__ import annotations

import hashlib
import logging
import time

from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger("convida.security")

# Retornado quando o cache falha: (permitido, segundos_para_retry)
_FAIL_OPEN: tuple[bool, int] = (True, 0)


def client_ip(request) -> str:
    """IP do cliente, respeitando N proxies reversos confiáveis à frente."""
    trusted = getattr(settings, "TRUSTED_PROXY_COUNT", 1)
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if trusted > 0 and forwarded:
        parts = [p.strip() for p in forwarded.split(",") if p.strip()]
        if parts:
            # O proxy mais externo confiável anexa o peer real no fim da lista;
            # tudo à esquerda pode ter sido forjado pelo cliente.
            return parts[max(0, len(parts) - trusted)]
    return request.META.get("REMOTE_ADDR") or "unknown"


def digest(value: str) -> str:
    """Hash curto — evita gravar e-mail em claro nas chaves do cache."""
    return hashlib.sha256(value.encode("utf-8", "replace")).hexdigest()[:16]


def hit(key: str, limit: int, window: int) -> tuple[bool, int]:
    """Registra um hit em `key`. Retorna (permitido, segundos até liberar)."""
    now = time.time()
    cache_key = f"rl:{key}"
    try:
        history = cache.get(cache_key) or []
        history = [ts for ts in history if ts > now - window]
        if len(history) >= limit:
            oldest = history[-limit]
            return False, max(1, int(window - (now - oldest)) + 1)
        history.insert(0, now)
        cache.set(cache_key, history, timeout=window)
        return True, 0
    except Exception:  # noqa: BLE001 — cache fora do ar não derruba a API
        logger.exception("rate limit indisponível (cache); liberando requisição")
        return _FAIL_OPEN


def current_count(key: str, window: int) -> int:
    """Quantos hits ainda estão dentro da janela (sem registrar um novo)."""
    now = time.time()
    try:
        history = cache.get(f"rl:{key}") or []
    except Exception:  # noqa: BLE001
        return 0
    return len([ts for ts in history if ts > now - window])


def clear(*keys: str) -> None:
    """Zera as janelas informadas (ex.: após um login bem-sucedido)."""
    try:
        cache.delete_many([f"rl:{k}" for k in keys])
    except Exception:  # noqa: BLE001
        logger.warning("falha ao limpar chaves de rate limit", exc_info=True)


def flag_set(key: str, ttl: int) -> None:
    try:
        cache.set(f"rlflag:{key}", 1, timeout=ttl)
    except Exception:  # noqa: BLE001
        logger.warning("falha ao marcar flag de rate limit", exc_info=True)


def flag_get(key: str) -> bool:
    try:
        return bool(cache.get(f"rlflag:{key}"))
    except Exception:  # noqa: BLE001
        return False


def flag_clear(*keys: str) -> None:
    try:
        cache.delete_many([f"rlflag:{k}" for k in keys])
    except Exception:  # noqa: BLE001
        pass
