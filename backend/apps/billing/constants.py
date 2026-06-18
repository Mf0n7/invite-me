"""Faixas de capacidade e preços do Convida.

Preço do evento (avulso) por faixa — incrementos crescentes a partir de 200.
Assinatura mensal = 1,8× o preço do evento (arredondado ao real), pois cobre
eventos ilimitados naquela faixa.
"""

FREE_CAPACITY = 20

# Capacidade -> preço do evento (avulso), em reais.
EVENT_TIER_PRICES = {
    50: 10,
    100: 20,
    150: 25,
    200: 28,
    250: 31,
    300: 35,
    350: 40,
    400: 46,
    450: 53,
    500: 61,
}

PAID_TIERS = sorted(EVENT_TIER_PRICES)

# Addon de lista de presentes (avulso por evento). Incluído em assinaturas ativas.
GIFT_ADDON_PRICE_CENTS = 500

SUBSCRIPTION_MULTIPLIER = 1.8

CURRENCY = "brl"


def event_price_cents(capacity: int) -> int:
    return EVENT_TIER_PRICES[capacity] * 100


def subscription_price_cents(capacity: int) -> int:
    reais = round(EVENT_TIER_PRICES[capacity] * SUBSCRIPTION_MULTIPLIER)
    return reais * 100


# Compatibilidade: preço avulso de um evento.
def price_cents(capacity: int) -> int:
    return event_price_cents(capacity)


def tier_label(capacity: int) -> str:
    return f"Faixa até {capacity} convidados"
