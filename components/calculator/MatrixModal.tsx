'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { MatrixResult } from '@/lib/numerology/calculate';
import { getPositionTieredInterpretation, type TieredInterpretation } from '@/lib/numerology/interpret';
import BlurReveal from '@/components/ui/BlurReveal';

interface MatrixModalProps {
  /** Currently selected position (1-9), or null if closed */
  position: number | null;
  result: MatrixResult;
  locale: 'de' | 'ru';
  /** Whether the user is logged in (shows full text) */
  isAuthenticated: boolean;
  /** Positions that are free (readable without login) */
  freePositions?: number[];
  /** Called when modal should close */
  onClose: () => void;
  /** Called when user clicks unlock CTA */
  onRequestAuth?: () => void;
}

function strengthColor(strength: TieredInterpretation['strength']): string {
  switch (strength) {
    case 'none': return 'text-white/30';
    case 'weak': return 'text-amber-400';
    case 'normal': return 'text-gold';
    case 'strong': return 'text-emerald-400';
    case 'dominant': return 'text-emerald-300';
    default: return 'text-white/30';
  }
}

function strengthLabel(strength: TieredInterpretation['strength'], locale: 'de' | 'ru'): string {
  const labels = {
    de: { none: 'Nicht vorhanden', weak: 'Schwach', normal: 'Normal', strong: 'Stark', dominant: 'Dominant' },
    ru: { none: 'Отсутствует', weak: 'Слабо', normal: 'Нормально', strong: 'Сильно', dominant: 'Доминирует' },
  };
  return labels[locale][strength] || '';
}

export default function MatrixModal({
  position,
  result,
  locale,
  isAuthenticated,
  freePositions = [1, 2, 3],
  onClose,
  onRequestAuth,
}: MatrixModalProps) {
  const isOpen = position !== null;
  const isUnlocked = isAuthenticated || (position !== null && freePositions.includes(position));

  // ESC key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!position) return null;

  const digits = result.grid[position] || [];
  const count = digits.length;
  const interp = getPositionTieredInterpretation(position, count, locale);
  const dots = Math.min(count, 5);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-modal flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.12, 0.23, 0.5, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-body/95 backdrop-blur-xl shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4 text-white/50" />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-4">
                {/* Position badge */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gold/10 border border-gold/25">
                  <span className="text-2xl font-bold text-gold">{position}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white leading-tight">{interp.title}</h3>
                  {/* Strength label */}
                  <span className={`text-xs font-semibold uppercase tracking-wider ${strengthColor(interp.strength)}`}>
                    {strengthLabel(interp.strength, locale)}
                  </span>
                </div>
              </div>

              {/* Digit display */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1">
                  <span className={`text-3xl font-bold tracking-wider ${count > 0 ? 'text-gold' : 'text-white/15'}`}>
                    {count > 0 ? digits.join('') : '—'}
                  </span>
                </div>
                {/* Strength dots */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full transition-all ${
                        i < dots ? 'bg-gold shadow-[0_0_4px_rgba(212,175,55,0.5)]' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {/* Teaser — always visible */}
              <p className="text-sm text-white/80 leading-relaxed">{interp.teaser}</p>

              {/* Full text */}
              {isUnlocked ? (
                <BlurReveal isRevealed={true} shimmer={true}>
                  <div className="rounded-xl border border-gold/15 bg-gold/5 p-4">
                    <p className="text-sm text-white/70 leading-relaxed">{interp.full}</p>
                  </div>
                </BlurReveal>
              ) : (
                <div className="relative">
                  <BlurReveal isRevealed={false}>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/50 leading-relaxed">{interp.full}</p>
                    </div>
                  </BlurReveal>
                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <button
                      onClick={() => onRequestAuth?.()}
                      className="flex items-center gap-2 rounded-full border border-gold/30 bg-body/90 px-5 py-2.5 text-xs font-medium text-gold shadow-card hover:bg-body hover:border-gold/50 transition-all backdrop-blur-sm"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      {locale === 'de' ? 'Anmelden & freischalten' : 'Войти и открыть'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
