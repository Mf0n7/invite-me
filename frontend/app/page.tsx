import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center text-center">
      <span className="mb-6 rounded-full border border-border bg-card/60 px-4 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        em construção · fase 0
      </span>

      <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
        O Penetra
      </h1>
      <p className="mt-4 max-w-md text-balance text-muted-foreground">
        Crie eventos, envie convites nominais e acompanhe quem confirmou presença.
        Discreto, elegante e sem complicação.
      </p>

      <div className="mt-8 flex gap-3">
        <Button asChild size="lg">
          <Link href="/dashboard">Criar evento</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">Entrar</Link>
        </Button>
      </div>

      <p className="mt-16 text-xs text-muted-foreground/70">
        Scaffold ativo — autenticação e eventos chegam nas próximas fases.
      </p>
    </main>
  );
}
