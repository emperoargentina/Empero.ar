// =============================================================================
// AnimatedSection - Wrapper para animaciones de scroll suaves
// =============================================================================

import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';

interface AnimatedSectionProps {
  children: ReactNode;
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const getVariants = (direction: AnimationDirection): Variants => {
  const distance = 40;
  
  const directions: Record<AnimationDirection, { hidden: Record<string, number>; visible: Record<string, number> }> = {
    up: {
      hidden: { opacity: 0, y: distance },
      visible: { opacity: 1, y: 0 },
    },
    down: {
      hidden: { opacity: 0, y: -distance },
      visible: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: distance },
      visible: { opacity: 1, x: 0 },
    },
    right: {
      hidden: { opacity: 0, x: -distance },
      visible: { opacity: 1, x: 0 },
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1 },
    },
  };

  return {
    hidden: directions[direction].hidden,
    visible: {
      ...directions[direction].visible,
      transition: {
        type: 'tween',
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };
};

export function AnimatedSection({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  once = true,
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15, margin: '-40px 0px' }}
      variants={getVariants(direction)}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  className = '',
  once = true,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 25 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: 'tween',
            ease: [0.25, 0.1, 0.25, 1],
            duration: 0.5,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover scale effect
interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function HoverScale({ children, className = '', scale = 1.02 }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade in on scroll with parallax-like effect
interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxSection({ children, className = '', speed = 0.5 }: ParallaxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: speed }}
      transition={{
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
