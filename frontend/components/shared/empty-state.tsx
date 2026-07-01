import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <CardContent className="pt-6">
        <p className="font-display text-xl">Nenhum evento ainda</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Que tal criar o primeiro? Leva menos de um minuto.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/events/new">
            <Plus /> Criar evento
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
