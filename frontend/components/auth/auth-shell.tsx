import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Link
        href="/"
        className="mb-8 font-display text-3xl font-semibold tracking-tight text-primary"
      >
        Convida
      </Link>
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

export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative my-2 flex items-center">
      <span className="flex-grow border-t border-border" />
      <span className="mx-3 text-xs uppercase tracking-wider text-muted-foreground">{children}</span>
      <span className="flex-grow border-t border-border" />
    </div>
  );
}

