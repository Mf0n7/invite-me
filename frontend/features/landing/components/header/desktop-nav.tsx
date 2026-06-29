import Link from "next/link";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

import { NAV, AUTH } from "./nav-links";

export function DesktopNav() {
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          className="px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {label}
        </a>
      ))}

      <div className="ml-3 flex items-center gap-1.5">
        <Button asChild variant="ghost" size="sm">
          <Link href={AUTH.login.href}>{AUTH.login.label}</Link>
        </Button>
        <Button asChild size="sm">
          <Link href={AUTH.register.href}>{AUTH.register.label}</Link>
        </Button>
        <ThemeToggle />
      </div>
    </nav>
  );
}
