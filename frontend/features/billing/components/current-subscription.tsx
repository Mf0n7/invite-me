import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Subscription {
  is_active: boolean;
  capacity: number;
}

interface CurrentSubscriptionProps {
  sub: Subscription | null | undefined;
  onManage: () => void;
  isLoading: boolean;
}

export function CurrentSubscription({
  sub,
  onManage,
  isLoading,
}: CurrentSubscriptionProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">Sua assinatura</CardTitle>
      </CardHeader>
      <CardContent>
        {sub?.is_active ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              Ativa:{" "}
              <span className="font-semibold">
                até {sub.capacity} convidados/mês
              </span>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onManage}
              disabled={isLoading}
            >
              <ExternalLink /> Gerenciar
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Plano{" "}
            <span className="font-medium text-foreground">grátis</span>{" "}
            (até 20 por evento).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
