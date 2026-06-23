import type { Transition } from "motion/react";

export const spring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 24,
};

export const tween: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

export const tweenSlow: Transition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4,
};
