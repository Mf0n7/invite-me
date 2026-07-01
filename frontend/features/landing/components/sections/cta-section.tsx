"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations/variants";

export function CtaSection() {
  return (
    <section className="py-32 px-6 text-center">
      <motion.div
        className="flex flex-col items-center gap-5"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Sua próxima festa
          <br />
          começa aqui.
        </h2>
        <p className="text-muted-foreground">Até 20 confirmados, grátis.</p>
        <Button asChild size="lg">
          <Link href="/register">Criar minha conta</Link>
        </Button>
      </motion.div>
    </section>
  );
}
