import type { Variants } from 'framer-motion'

/**
 * Reusable animation variants for consistent motion design across the app
 */

// Fade in from below
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

// Fade in from left
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

// Fade in from right
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

// Stagger children with fade in up
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

// Scale up on hover (for cards and images)
export const hoverScale = {
  rest: { scale: 1 },
  hover: {
    scale: 1.08,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
    },
  },
}

// Button interactions
export const buttonHover = {
  scale: 1.05,
  transition: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },
}

export const buttonTap = {
  scale: 0.97,
}

// Viewport settings for scroll animations
export const scrollViewport = {
  once: true,
  amount: 0.3 as const,
}
