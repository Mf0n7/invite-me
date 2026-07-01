import type { Metadata } from "next";

import { CtaSection } from "@/features/landing/components/sections/cta-section";
import { FeaturesSection } from "@/features/landing/components/sections/features-section";
import { Footer } from "@/features/landing/components/footer";
import { Header } from "@/features/landing/components/header/header";
import { Hero } from "@/features/landing/components/sections/hero";
import { HowItWorks } from "@/features/landing/components/sections/how-it-works";

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <Hero />
      <HowItWorks />
      <FeaturesSection />
      <CtaSection />
      <Footer />
    </>
  );
}
