"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { fadeUp } from "@/lib/animations/variants";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
