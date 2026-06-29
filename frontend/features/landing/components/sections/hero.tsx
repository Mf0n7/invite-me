"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { PartyPopper } from "lucide-react";

import { Button } from "@/components/ui/button";
import { staggerContainer, staggerItem } from "@/lib/animations/variants";

export function Hero() {
  return (
    <section className="flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center px-6 text-center">
      <motion.div
        className="flex max-w-2xl flex-col items-center gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={staggerItem}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-primary animate-pulse"
        >
          <PartyPopper className="size-3.5" /> grátis para começar
        </motion.span>

        <motion.h1
          variants={staggerItem}
          className="font-display text-5xl leading-tight font-semibold tracking-tight sm:text-6xl sm:leading-none lg:text-7xl"
        >
          Faça sua <em className="text-primary">festa</em> acontecer
        </motion.h1>

        <motion.p
          variants={staggerItem}
          className="max-w-md text-balance text-lg text-muted-foreground"
        >
          Convites digitais, confirmação de presença em tempo real e lista de
          presentes. Simples, bonito e festivo.
        </motion.p>

        <motion.div
          variants={staggerItem}
          className="flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
        >
          <Button asChild size="lg">
            <Link href="/register">Criar minha conta</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#como-funciona">Como funciona</a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
