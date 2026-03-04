'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface BlurRevealProps {
  /** Whether the content is revealed (unblurred) */
  isRevealed: boolean;
  /** Content to render */
  children: ReactNode;
  /** Duration in seconds */
  duration?: number;
  /** Show gold shimmer sweep on reveal */
  shimmer?: boolean;
  /** Additional className */
  className?: string;
}

export default function BlurReveal({
  isRevealed,
  children,
  duration = 0.6,
  shimmer = true,
  className = '',
}: BlurRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={`relative ${className}`}>
        {isRevealed ? (
          children
        ) : (
          <div className="select-none pointer-events-none blur-[6px] opacity-50">
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial={false}
        animate={{
          filter: isRevealed ? 'blur(0px)' : 'blur(6px)',
          opacity: isRevealed ? 1 : 0.5,
        }}
        transition={{ duration, ease: [0.12, 0.23, 0.5, 1] }}
        className={isRevealed ? '' : 'select-none pointer-events-none'}
      >
        {children}
      </motion.div>

      {/* Gold shimmer sweep on reveal */}
      {shimmer && isRevealed && (
        <motion.div
          initial={{ x: '-100%', opacity: 0.6 }}
          animate={{ x: '200%', opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-transparent via-gold/15 to-transparent"
        />
      )}
    </div>
  );
}
