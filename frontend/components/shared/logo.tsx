import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  onClick,
}: {
  href?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}>
      <span className={cn("font-display text-2xl font-semibold text-primary", className)}>
        Convida
      </span>
    </Link>
  );
}
