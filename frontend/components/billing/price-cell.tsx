export function PriceCell({
  capacity,
  price,
  per,
}: {
  capacity: number;
  price: string;
  per: string;
}) {
  return (
    <div className="rounded-xl border border-border p-4 transition-colors hover:border-primary/50 hover:bg-primary/5">
      <p className="text-sm font-medium">até {capacity}</p>
      <p className="font-display text-lg">
        {price}
        <span className="text-xs text-muted-foreground">/{per}</span>
      </p>
    </div>
  );
}
