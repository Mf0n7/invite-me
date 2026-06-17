"""Faixas de capacidade e preços do O Penetra.

Preço = R$ 0,20 por convidado da capacidade => capacity * 20 centavos.
Até 20 convidados é grátis.
"""

FREE_CAPACITY = 20

# Faixas pagas disponíveis (capacidade de nomes/convidados).
PAID_TIERS = [50, 100, 150, 200, 300, 400, 500]

CURRENCY = "brl"


def price_cents(capacity: int) -> int:
    """Preço em centavos para uma capacidade (R$ 0,20 por convidado)."""
    return capacity * 20


def tier_label(capacity: int) -> str:
    return f"Faixa até {capacity} convidados"
