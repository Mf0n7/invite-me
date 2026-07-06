import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  onClick,
  hideTextOnMobile = false,
}: {
  href?: string;
  className?: string;
  onClick?: () => void;
  hideTextOnMobile?: boolean;
}) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-1">
      <Image src="/logo-convida.svg" alt="" width={35} height={35} />
      <span
        className={cn(
          "text-2xl font-semibold text-primary",
          hideTextOnMobile && "hidden md:inline",
          className,
        )}
      >
        Convida
      </span>
    </Link>
  );
}
