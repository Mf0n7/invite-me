"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function BackButton({ href, label = "Voltar" }: { href?: string; label?: string }) {
  const router = useRouter();
  const className =
    "mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground";

  if (href) {
    return (
      <Link href={href} className={className}>
        <ArrowLeft className="size-4" /> {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => router.back()} className={className}>
      <ArrowLeft className="size-4" /> {label}
    </button>
  );
}
