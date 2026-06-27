"use client";

import { motion } from "motion/react";
import { Users, Zap, Gift, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations/variants";

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Users,
    title: "Convites nominais",
    description:
      "Cada pessoa recebe o próprio link. Você sabe exatamente quem vai.",
  },
  {
    icon: Zap,
    title: "RSVP em tempo real",
    description: "Confirmações chegam na hora. Sem precisar ligar pra ninguém.",
  },
  {
    icon: Gift,
    title: "Lista de presentes",
    description: "Integrada ao evento. Os convidados veem tudo na mesma página.",
  },
  {
    icon: Sparkles,
    title: "Grátis para começar",
    description: "Até 20 confirmados sem pagar nada. Sem cartão de crédito.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="container max-w-4xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-primary">
            o que você ganha
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Tudo que a festa precisa
          </h2>
        </motion.div>

        <motion.div
          className="grid gap-5 sm:grid-cols-2"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={staggerItem}
                className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm"
              >
                <Icon className="mb-4 size-5 text-primary" />
                <h3 className="mb-1.5 font-semibold">{feat.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feat.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
