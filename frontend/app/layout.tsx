import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/lib/providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "O Penetra",
  description:
    "Crie eventos, gerencie convites e confirme presenças. Sem penetra não convidado.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
