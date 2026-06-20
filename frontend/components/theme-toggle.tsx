"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Alternar modo claro/escuro"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* Evita mismatch de hidratação: só mostra o ícone após montar */}
      {mounted ? isDark ? <Sun /> : <Moon /> : <Sun className="opacity-0" />}
    </Button>
  );
}
