'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { MatrixResult } from '@/lib/numerology/calculate';
import { getPositionTieredInterpretation, type TieredInterpretation } from '@/lib/numerology/interpret';
import BlurReveal from '@/components/ui/BlurReveal';

interface PositionAccordionProps {
  result: MatrixResult;
  locale: 'de' | 'ru';
  /** Whether the extended (full) text is unlocked (email entered) */
  isFullUnlocked: boolean;
  /** Callback when user clicks the CTA to unlock full text */
  onRequestUnlock?: () => void;
  /** Positions that show full text for free (without email) */
  freePositions?: number[];
}

function getStrengthDots(count: number): number {
  return Math.min(count, 5);
}

function PositionRow({
  position,
  result,
  locale,
  isFullUnlocked,
  onRequestUnlock,
  isFreePosition,
}: {
  position: number;
  result: MatrixResult;
  locale: 'de' | 'ru';
  isFullUnlocked: boolean;
  onRequestUnlock?: () => void;
  isFreePosition: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const digits = result.grid[position] || [];
  const count = digits.length;
  const interp = getPositionTieredInterpretation(position, count, locale);
  const dots = getStrengthDots(count);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-card transition-all hover:shadow-card-hover hover:border-gold/20 overflow-hidden cursor-pointer">
      {/* Header — always visible, clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left group hover:bg-white/5 transition-colors active:scale-[0.995]"
      >
        {/* Position number */}
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold font-bold text-sm border border-gold/20">
          {position}
        </span>

        {/* Title */}
        <span className="flex-1 text-sm font-semibold text-white truncate">
          {interp.title}
        </span>

        {/* Digit display */}
        <span className={`text-base font-bold tracking-wider shrink-0 ${count > 0 ? 'text-gold' : 'text-white/15'}`}>
          {count > 0 ? digits.join('') : '—'}
        </span>

        {/* Strength dots */}
        <div className="flex gap-0.5 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i < dots ? 'bg-gold' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-white/30 group-hover:text-white transition-colors" />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.12, 0.23, 0.5, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Teaser text — always visible */}
              <p className="text-sm text-white/70 leading-relaxed">
                {interp.teaser}
              </p>

              {/* Full text — free for freePositions, otherwise behind email gate */}
              {(isFreePosition || isFullUnlocked) ? (
                <BlurReveal isRevealed={true} shimmer={!isFreePosition}>
                  <div className="rounded-lg border border-gold/10 bg-gold/5 p-3">
                    <p className="text-sm text-white/70 leading-relaxed">
                      {interp.full}
                    </p>
                  </div>
                </BlurReveal>
              ) : (
                <div className="relative">
                  <BlurReveal isRevealed={false}>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="text-sm text-white/50 leading-relaxed">
                        {interp.full}
                      </p>
                    </div>
                  </BlurReveal>
                  {/* Unlock CTA overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestUnlock?.();
                      }}
                      className="flex items-center gap-2 rounded-full border border-gold/30 bg-body/90 px-4 py-2 text-xs font-medium text-gold shadow-card hover:bg-body hover:border-gold/50 transition-all backdrop-blur-sm"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      {locale === 'de' ? 'Vollständige Analyse freischalten' : 'Открыть полный анализ'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PositionAccordion({
  result,
  locale,
  isFullUnlocked,
  onRequestUnlock,
  freePositions = [1, 2, 3],
}: PositionAccordionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider px-1 mb-3">
        {locale === 'de' ? 'Positionen' : 'Позиции'}
      </h3>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pos) => (
        <PositionRow
          key={pos}
          position={pos}
          result={result}
          locale={locale}
          isFullUnlocked={isFullUnlocked}
          onRequestUnlock={onRequestUnlock}
          isFreePosition={freePositions.includes(pos)}
        />
      ))}
    </div>
  );
}
