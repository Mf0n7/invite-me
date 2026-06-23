import { Check } from "lucide-react";
import { formatBRL } from "@/lib/utils";

interface Tier {
  capacity: number;
  subscription_cents: number;
}

interface Subscription {
  is_active: boolean;
  capacity: number;
}

interface SubscriptionTierButtonProps {
  tier: Tier;
  sub: Subscription | null | undefined;
  onSubscribe: (capacity: number) => void;
  isPending: boolean;
}

export function SubscriptionTierButton({
  tier,
  sub,
  onSubscribe,
  isPending,
}: SubscriptionTierButtonProps) {
  const isCurrent = sub?.is_active && sub.capacity === tier.capacity;

  return (
    <button
      disabled={isCurrent || isPending}
      onClick={() => onSubscribe(tier.capacity)}
      className={`rounded-xl border p-3 text-left transition-colors disabled:opacity-100 ${
        isCurrent
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50"
      }`}
    >
      <p className="text-sm font-medium">até {tier.capacity}</p>
      <p className="font-display text-lg">
        {formatBRL(tier.subscription_cents)}
        <span className="text-xs text-muted-foreground">/mês</span>
      </p>
      <p className="mt-1 text-xs text-primary">
        {isCurrent ? (
          <span className="flex items-center gap-1">
            <Check className="size-3" /> atual
          </span>
        ) : (
          "assinar"
        )}
      </p>
    </button>
  );
}
