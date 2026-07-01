import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function InvitePageSkeleton() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center py-12">
      <Card className="w-full max-w-lg overflow-hidden">
        {/* photo */}
        <Skeleton className="h-48 w-full rounded-none" />

        <CardHeader className="space-y-2">
          {/* "Você está convidado" */}
          <Skeleton className="h-3 w-36" />
          {/* título */}
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>

        <CardContent className="space-y-5">
          {/* descrição */}
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>

          {/* data + endereço */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          <hr className="border-border" />

          {/* campo nome */}
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* botão */}
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* "Powered by Convida" */}
      <Skeleton className="mt-6 h-3 w-28" />
    </main>
  );
}
