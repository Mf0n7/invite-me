import { Variants } from "motion/react";

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
    },
  },
};

export const hoverScale = {
  whileHover: {
    scale: 1.02,
  },
  whileTap: {
    scale: 0.98,
  },
};
