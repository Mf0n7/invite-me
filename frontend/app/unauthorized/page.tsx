"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  scalePop,
  staggerContainer,
  staggerItem,
} from "@/lib/animations/variants";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        className="flex flex-col items-center text-center gap-8 max-w-sm"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          className="text-[10rem] leading-none font-bold text-primary select-none"
          variants={scalePop}
        >
          401
        </motion.span>

        <motion.div className="flex flex-col gap-2" variants={staggerItem}>
          <h1 className="text-2xl font-semibold text-foreground">
            Você precisa entrar
          </h1>
          <p className="text-muted-foreground text-base">
            Faça login para acessar essa página.
          </p>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Button asChild>
            <Link href="/login">
              <ArrowLeft className="w-4 h-4" />
              Ir para o login
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
