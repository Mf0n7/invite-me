"use client";

import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Separator } from "@/components/ui/separator";
import { useLenis } from "@/context/lenis";

const navigation = [
  { href: "#", label: "Início" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#recursos", label: "Recursos" },
];

const account = [
  { href: "/login", label: "Entrar" },
  { href: "/register", label: "Criar conta" },
];

export function Footer() {
  const lenis = useLenis();

  return (
    <footer className="border-t bg-card/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Marca */}
          <div className="space-y-1">
            <Logo href="/" />

            <p className="max-w-xs text-sm text-muted-foreground">
              Gerencie convidados, confirmações de presença e listas de forma
              simples e organizada.
            </p>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="mt-3 text-sm font-semibold text-primary">
              Navegação:
            </h3>

            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.href === "#") {
                        lenis?.scrollTo(0);
                      } else {
                        lenis?.scrollTo(item.href, { offset: -56 });
                      }
                    }}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Conta */}
          <div>
            <h3 className="mt-3 text-sm font-semibold text-primary">Conta:</h3>
            <ul className="space-y-2">
              {account.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="border-border" />

      <div className="py-6">
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Convida. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
