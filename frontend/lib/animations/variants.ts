import type { Variants } from "motion/react";
import { spring, springGentle, tween, tweenSlow } from "./transitions";

// ─── Page / layout ────────────────────────────────────────────────────────────

/** Entrada padrão de página: sobe levemente enquanto aparece */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { ...springGentle } },
};

/** Fade simples, sem deslocamento — bom para modais e overlays */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { ...tween } },
  exit: { opacity: 0, transition: { ...tween } },
};

// ─── Listas / stagger ─────────────────────────────────────────────────────────

/** Container que distribui a animação entre os filhos */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

/** Item filho usado dentro de staggerContainer */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { ...spring } },
};

// ─── Cards / hover ────────────────────────────────────────────────────────────

/** Escala sutil ao hover — bom para cards clicáveis */
export const cardHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.015, transition: { ...spring } },
};

// ─── Slide lateral ────────────────────────────────────────────────────────────

/** Entra pela direita — útil para drawers ou painéis laterais */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { ...tweenSlow } },
  exit: { opacity: 0, x: 40, transition: { ...tween } },
};

/** Entra pela esquerda */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { ...tweenSlow } },
  exit: { opacity: 0, x: -40, transition: { ...tween } },
};

// ─── Scale ────────────────────────────────────────────────────────────────────

/** Pop suave — bom para badges, toasts, itens que aparecem dinamicamente */
export const scalePop: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { ...spring } },
  exit: { opacity: 0, scale: 0.88, transition: { ...tween } },
};
