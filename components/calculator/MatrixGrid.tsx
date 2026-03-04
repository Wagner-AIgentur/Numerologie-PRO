'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Lock, Info } from 'lucide-react';
import type { MatrixResult } from '@/lib/numerology/calculate';

interface MatrixGridProps {
  result: MatrixResult;
  locale?: 'de' | 'ru';
  isAuthenticated?: boolean;
  freePositions?: number[];
  onCellClick?: (position: number) => void;
  onLockedClick?: () => void;
  birthDate?: string;
}

/** Line labels for side/bottom cells */
const LINE_LABELS = {
  de: {
    row1: 'Ziel',
    row2: 'Familie',
    row3: 'Gewohnheit',
    col1: 'Selbstwert',
    col2: 'Alltag',
    col3: 'Talent',
    diagonalUp: 'Temperament',
    diagonalDown: 'Spiritualit\u00e4t',
  },
  ru: {
    row1: '\u0426\u0435\u043b\u044c',
    row2: '\u0421\u0435\u043c\u044c\u044f',
    row3: '\u041f\u0440\u0438\u0432\u044b\u0447\u043a\u0438',
    col1: '\u0421\u0430\u043c\u043e\u043e\u0446\u0435\u043d\u043a\u0430',
    col2: '\u0411\u044b\u0442',
    col3: '\u0422\u0430\u043b\u0430\u043d\u0442',
    diagonalUp: '\u0422\u0435\u043c\u043f\u0435\u0440\u0430\u043c\u0435\u043d\u0442',
    diagonalDown: '\u0414\u0443\u0445\u043e\u0432\u043d\u043e\u0441\u0442\u044c',
  },
};

/** Dynamic font size based on digit count */
function getDigitSizeClasses(count: number): string {
  if (count <= 2) return 'text-xl sm:text-2xl md:text-3xl';
  if (count <= 4) return 'text-lg sm:text-xl md:text-2xl';
  if (count <= 6) return 'text-sm sm:text-base md:text-lg';
  if (count <= 8) return 'text-xs sm:text-sm md:text-base';
  return 'text-[10px] sm:text-xs md:text-sm';
}

/** Compact cell for line values (right column + bottom row) */
const LineValueCell = memo(function LineValueCell({
  label,
  value,
  delay,
}: {
  label: string;
  value: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.12, 0.23, 0.5, 1] }}
      className="flex flex-col items-center justify-center rounded-xl overflow-hidden
        border border-white/10 bg-white/5 backdrop-blur-xl p-1 sm:p-2 md:p-3
        hover:border-gold/20 transition-all duration-300 min-w-0"
    >
      <span className="text-[6px] sm:text-[8px] md:text-[10px] text-white/80 uppercase tracking-wider text-center leading-tight mb-0.5 md:mb-1 break-words hyphens-auto max-w-full">
        {label}
      </span>
      <span className="font-mono text-sm sm:text-lg md:text-xl font-bold text-gold">
        {value}
      </span>
    </motion.div>
  );
});

/** Main position cell */
const CellBox = memo(function CellBox({
  pos,
  digits,
  name,
  delay,
  isUnlocked,
  onClick,
}: {
  pos: number;
  digits: number[];
  name: string;
  delay: number;
  isUnlocked: boolean;
  onClick: () => void;
}) {
  const hasDigits = digits.length > 0;
  const count = digits.length;
  const dots = Math.min(count, 5);

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.12, 0.23, 0.5, 1] }}
      className={`
        group relative flex flex-col items-center justify-center overflow-hidden min-w-0
        min-h-[80px] sm:min-h-[110px] md:min-h-[120px]
        rounded-xl border p-1.5 sm:p-3 md:p-4
        transition-all duration-300
        ${hasDigits
          ? 'border-gold/30 bg-gold/5 backdrop-blur-xl hover:border-gold hover:bg-gold/10 hover:shadow-2xl hover:shadow-gold/20'
          : 'border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/20 hover:bg-white/10'
        }
        ${!isUnlocked ? 'opacity-60' : ''}
      `}
    >
      {/* Position Number */}
      <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 text-[10px] font-semibold text-white/70">
        {pos}
      </span>

      {/* Position Name */}
      <p className="text-[9px] md:text-[10px] font-semibold text-white/90 uppercase tracking-wider mb-1 sm:mb-1.5 text-center">
        {name}
      </p>

      {/* Digits or Empty State */}
      {hasDigits ? (
        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
          <span className={`font-mono font-bold text-gold tracking-normal sm:tracking-wider ${getDigitSizeClasses(count)} max-w-full truncate`}>
            {digits.join('')}
          </span>
          <span className="text-[9px] text-white/70 font-medium">
            {count}&times;
          </span>
        </div>
      ) : (
        <span className="text-3xl text-white/15 font-light">&mdash;</span>
      )}

      {/* Strength Dots */}
      {hasDigits && (
        <div className="flex gap-0.5 mt-1 sm:mt-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 w-1 rounded-full ${
                i < dots
                  ? isUnlocked ? 'bg-gold shadow-sm shadow-gold/50' : 'bg-white/20'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      )}

      {/* Lock Badge */}
      {!isUnlocked && (
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
          <Lock className="h-3.5 w-3.5 text-white/25 group-hover:text-gold/50 transition-colors" />
        </div>
      )}

      {/* Hover Indicator */}
      <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Info className="h-3.5 w-3.5 text-gold" />
      </div>
    </motion.button>
  );
});

export default function MatrixGrid({
  result,
  locale = 'de',
  isAuthenticated = false,
  freePositions = [1, 2, 3],
  onCellClick,
  onLockedClick,
  birthDate,
}: MatrixGridProps) {
  const t = useTranslations('positions');
  const labels = LINE_LABELS[locale];
  const { rows, columns, diagonalDown, diagonalUp } = result.lines;

  const renderCell = (pos: number, delay: number) => {
    const digits = result.grid[pos] || [];
    const isUnlocked = isAuthenticated || freePositions.includes(pos);

    return (
      <CellBox
        key={pos}
        pos={pos}
        digits={digits}
        name={t(`${pos}.name`)}
        delay={delay}
        isUnlocked={isUnlocked}
        onClick={() => {
          if (isUnlocked) {
            onCellClick?.(pos);
          } else {
            onLockedClick?.();
          }
        }}
      />
    );
  };

  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_minmax(44px,0.5fr)] gap-1 sm:gap-2 md:gap-3">
      {/* === Row 0: Header Bar (col 1-3) + Temperament (col 4) === */}
      {birthDate && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-3 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 md:p-4"
          >
            <div className="flex flex-col items-center">
              <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest text-white/70 font-medium">
                {locale === 'de' ? 'Geburtsdatum' : '\u0414\u0430\u0442\u0430 \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f'}
              </p>
              <p className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-gold">
                {birthDate}
              </p>
            </div>
          </motion.div>

          {/* Temperament - top right corner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-gold/20 bg-gold/5 backdrop-blur-xl p-1 sm:p-2 md:p-3 overflow-hidden min-w-0"
          >
            <span className="text-[6px] sm:text-[8px] md:text-[9px] text-white/80 uppercase tracking-wider text-center leading-tight mb-0.5 break-words hyphens-auto max-w-full">
              {labels.diagonalUp}
            </span>
            <span className="font-mono text-sm sm:text-xl md:text-2xl font-bold text-gold">
              {diagonalUp}
            </span>
          </motion.div>
        </>
      )}

      {/* === Row 1: pos 1, 4, 7 + Ziel === */}
      {renderCell(1, 0.05)}
      {renderCell(4, 0.10)}
      {renderCell(7, 0.15)}
      <LineValueCell label={labels.row1} value={rows[0]} delay={0.20} />

      {/* === Row 2: pos 2, 5, 8 + Familie === */}
      {renderCell(2, 0.15)}
      {renderCell(5, 0.20)}
      {renderCell(8, 0.25)}
      <LineValueCell label={labels.row2} value={rows[1]} delay={0.30} />

      {/* === Row 3: pos 3, 6, 9 + Gewohnheit === */}
      {renderCell(3, 0.25)}
      {renderCell(6, 0.30)}
      {renderCell(9, 0.35)}
      <LineValueCell label={labels.row3} value={rows[2]} delay={0.40} />

      {/* === Row 4 (bottom): Selbstwert, Alltag, Talent, Spiritualitaet === */}
      <LineValueCell label={labels.col1} value={columns[0]} delay={0.45} />
      <LineValueCell label={labels.col2} value={columns[1]} delay={0.50} />
      <LineValueCell label={labels.col3} value={columns[2]} delay={0.55} />
      <LineValueCell label={labels.diagonalDown} value={diagonalDown} delay={0.60} />
    </div>
  );
}
