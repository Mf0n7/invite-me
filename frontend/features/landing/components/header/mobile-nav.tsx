import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MobileNav({ onOpen }: { onOpen: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Abrir menu"
      className="md:hidden"
      onClick={onOpen}
    >
      <Menu />
    </Button>
  );
}
