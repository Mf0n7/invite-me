import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mb-8">
        <Logo className="text-3xl tracking-tight" />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
      <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
    </main>
  );
}


