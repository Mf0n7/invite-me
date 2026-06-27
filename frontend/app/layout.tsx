import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { Providers } from "@/context/providers";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://convida.app";

const description =
  "Crie convites online grátis, envie convites digitais para festas e acompanhe a confirmação " +
  "de presença (RSVP) em tempo real. Lista de convidados, convites nominais e lista de presentes " +
  "para aniversários, casamentos, chá de bebê, formaturas e qualquer evento.";

const keywords = [
  "convite online",
  "convite digital",
  "convite virtual",
  "confirmação de presença",
  "RSVP",
  "lista de presença",
  "lista de convidados",
  "convite de aniversário",
  "convite de casamento",
  "convite de festa",
  "chá de bebê",
  "chá de panela",
  "formatura",
  "lista de presentes",
  "organizar festa",
  "gerenciar convidados",
  "criar convite",
  "convite de evento",
  "festa",
  "aniversário",
  "casamento",
  "evento online",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Convida — Convites online e confirmação de presença (RSVP) para festas",
    template: "Convida | %s",
  },
  description,
  keywords,
  applicationName: "Convida",
  authors: [{ name: "Convida" }],
  creator: "Convida",
  publisher: "Convida",
  category: "events",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Convida",
    title: "Convida — Convites online e confirmação de presença para festas",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Convida — Convites online e confirmação de presença",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/favicons/apple-touch-icon.png" },
    other: [
      { rel: "android-chrome-192x192", url: "/favicons/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/favicons/android-chrome-512x512.png" },
    ],
  },
  manifest: "/favicons/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
