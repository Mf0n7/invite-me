"""Cria/atualiza os planos de assinatura recorrentes no Stripe.

Uso: python manage.py seed_stripe
Requer STRIPE_SECRET_KEY configurada.
"""
from django.core.management.base import BaseCommand, CommandError

from apps.billing.constants import PAID_TIERS, price_cents
from apps.billing.models import SubscriptionPlan
from apps.billing.services import ensure_subscription_price, stripe_enabled


class Command(BaseCommand):
    help = "Cria os planos de assinatura (faixas) no Stripe e localmente."

    def handle(self, *args, **options):
        if not stripe_enabled():
            raise CommandError("STRIPE_SECRET_KEY não configurada.")

        for capacity in PAID_TIERS:
            plan, _ = SubscriptionPlan.objects.get_or_create(
                capacity=capacity,
                defaults={"amount_cents": price_cents(capacity)},
            )
            plan.amount_cents = price_cents(capacity)
            if not plan.stripe_price_id:
                ensure_subscription_price(plan)
                self.stdout.write(self.style.SUCCESS(f"Faixa {capacity}: {plan.stripe_price_id}"))
            else:
                plan.save(update_fields=["amount_cents"])
                self.stdout.write(f"Faixa {capacity}: já existia ({plan.stripe_price_id})")

        self.stdout.write(self.style.SUCCESS("Planos de assinatura prontos."))
