import type { Metadata } from "next";
import Link from "next/link";
import { PartyPopper } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Convida — Convites online grátis e confirmação de presença (RSVP)",
  description:
    "Crie convites online para aniversário, casamento, chá de bebê e qualquer festa. " +
    "Envie convites nominais, acompanhe a confirmação de presença e monte sua lista de presentes. " +
    "Comece grátis.",
  alternates: { canonical: "/" },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://convida.app";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Convida",
      url: siteUrl,
      inLanguage: "pt-BR",
      description:
        "Convites online e confirmação de presença (RSVP) para festas, aniversários e casamentos.",
    },
    {
      "@type": "SoftwareApplication",
      name: "Convida",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      url: siteUrl,
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      description:
        "Plataforma para criar convites digitais, gerenciar a lista de convidados, receber " +
        "confirmações de presença e organizar a lista de presentes do seu evento.",
    },
  ],
};

export default function Home() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1 text-xs uppercase tracking-[0.2em] text-primary animate-pulse">
        <PartyPopper className="size-3.5" /> sua festa começa aqui
      </span>

      <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">Convida</h1>
      <p className="mt-4 max-w-md text-balance text-muted-foreground">
        Crie eventos, envie convites nominais e acompanhe quem confirmou presença — com lista de
        presentes e tudo. Simples, bonito e festivo.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href="/register">Criar minha conta</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">Entrar</Link>
        </Button>
      </div>
    </main>
  );
}
