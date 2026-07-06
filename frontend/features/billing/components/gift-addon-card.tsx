import { Gift } from "lucide-react";
import { formatBRL } from "@/lib/utils";

interface GiftAddonCardProps {
  priceCents: number | undefined;
}

export function GiftAddonCard({ priceCents }: GiftAddonCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/50 hover:bg-primary/5">
      <Gift className="size-6 text-primary" />
      <div>
        <p className="font-semibold text-lg">
          {priceCents ? formatBRL(priceCents) : "—"}
          <span className="text-xs text-muted-foreground"> /evento</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Libere direto na página do evento.
        </p>
      </div>
    </div>
  );
}
