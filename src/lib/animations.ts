import type { Variants } from 'framer-motion'

// --- Entrance animations ---

export const slideUp: Variants = {
  initial: {
    y: 60,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    y: -60,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

export const slideDown: Variants = {
  initial: { y: -60, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { y: 60, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
}

export const slideInFromLeft: Variants = {
  initial: { x: -60, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { x: -60, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
}

export const slideInFromRight: Variants = {
  initial: { x: 60, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { x: 60, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
}

export const scaleIn: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
}

export const bounceIn: Variants = {
  initial: { scale: 0.3, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 600, damping: 15 },
  },
  exit: { scale: 0.3, opacity: 0, transition: { duration: 0.2 } },
}

// --- Modal animations ---

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15, ease: 'easeIn' } },
}

// --- Interaction animations ---

export const cardHover: Variants = {
  initial: {},
  hover: { y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)', transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
}

export const buttonTap: Variants = {
  tap: { scale: 0.97 },
}

// --- Continuous animations ---

export const pulse: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
}

export const spinner: Variants = {
  animate: {
    rotate: 360,
    transition: { duration: 1, repeat: Infinity, ease: 'linear' },
  },
}

// --- Stagger variants ---

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
}

export const staggerContainerFast: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05 } },
}

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.2 } },
}

export const staggerContainerReverse: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1, staggerDirection: -1 } },
}

// --- Spring configs ---

export const SPRING_CONFIGS = {
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30 },
  smooth: { type: 'spring' as const, stiffness: 300, damping: 25 },
  bouncy: { type: 'spring' as const, stiffness: 600, damping: 15 },
} as const
