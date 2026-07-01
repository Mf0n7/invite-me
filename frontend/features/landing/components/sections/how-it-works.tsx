"use client";

import { motion } from "motion/react";

import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations/variants";

const steps = [
  {
    label: "01",
    title: "Crie seu evento",
    description: "Nome, data, local e foto. Pronto em menos de dois minutos.",
  },
  {
    label: "02",
    title: "Envie os convites",
    description:
      "Um link único para cada convidado, ou um link público para todos.",
  },
  {
    label: "03",
    title: "Acompanhe ao vivo",
    description: "Veja quem confirmou presença em tempo real, pelo celular.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24">
      <div className="container max-w-4xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-primary">
            como funciona
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Três passos para a festa perfeita
          </h2>
        </motion.div>

        <motion.div
          className="grid gap-10 sm:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {steps.map((step) => (
            <motion.div key={step.label} variants={staggerItem}>
              <div className="mb-4 border-t-2 border-primary/20 pt-4">
                <span className="text-xs font-semibold tracking-widest text-primary">
                  {step.label}
                </span>
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
