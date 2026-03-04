'use client';

import { motion } from 'framer-motion';
import type { MatrixResult } from '@/lib/numerology/calculate';
import { getLineInterpretation, type Interpretation } from '@/lib/numerology/interpret';
import BlurReveal from '@/components/ui/BlurReveal';

interface LinesAnalysisProps {
  result: MatrixResult;
  locale: 'de' | 'ru';
  unlocked: boolean;
}

type LineConfig = {
  key: string;
  positions: number[];
  getValue: (result: MatrixResult) => number;
};

const LINES: LineConfig[] = [
  { key: 'row1', positions: [1, 4, 7], getValue: (r) => r.lines.rows[0] },
  { key: 'row2', positions: [2, 5, 8], getValue: (r) => r.lines.rows[1] },
  { key: 'row3', positions: [3, 6, 9], getValue: (r) => r.lines.rows[2] },
  { key: 'col1', positions: [1, 2, 3], getValue: (r) => r.lines.columns[0] },
  { key: 'col2', positions: [4, 5, 6], getValue: (r) => r.lines.columns[1] },
  { key: 'col3', positions: [7, 8, 9], getValue: (r) => r.lines.columns[2] },
  { key: 'diagonalDown', positions: [1, 5, 9], getValue: (r) => r.lines.diagonalDown },
  { key: 'diagonalUp', positions: [3, 5, 7], getValue: (r) => r.lines.diagonalUp },
];

const SECTION_LABELS = {
  de: { rows: 'Zeilen', cols: 'Spalten', diags: 'Diagonalen' },
  ru: { rows: 'Строки', cols: 'Столбцы', diags: 'Диагонали' },
};

/** Mini 3x3 grid highlighting which cells belong to this line */
function MiniGrid({ positions }: { positions: number[] }) {
  const gridOrder = [1, 4, 7, 2, 5, 8, 3, 6, 9];
  return (
    <div className="grid grid-cols-3 gap-0.5 w-[34px] h-[34px] shrink-0">
      {gridOrder.map((pos) => (
        <div
          key={pos}
          className={`rounded-[2px] ${
            positions.includes(pos)
              ? 'bg-gold/70'
              : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  );
}

function strengthColor(strength: Interpretation['strength']): string {
  switch (strength) {
    case 'none': return 'text-white/20';
    case 'weak': return 'text-amber-500';
    case 'normal': return 'text-gold';
    case 'strong': return 'text-emerald-400';
    case 'dominant': return 'text-emerald-300';
    default: return 'text-white/30';
  }
}

function LineCard({
  line,
  result,
  locale,
  idx,
}: {
  line: LineConfig;
  result: MatrixResult;
  locale: 'de' | 'ru';
  idx: number;
}) {
  const count = line.getValue(result);
  const interp = getLineInterpretation(line.key, count, locale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, ease: [0.12, 0.23, 0.5, 1] }}
      className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 shadow-card hover:shadow-card-hover hover:border-gold/20 transition-all"
    >
      <div className="flex items-start gap-3">
        <MiniGrid positions={line.positions} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h4 className="font-semibold text-white text-sm truncate">{interp.title}</h4>
            <span className={`text-xs font-bold uppercase tracking-wider shrink-0 ${strengthColor(interp.strength)}`}>
              {count}
            </span>
          </div>
          {/* Strength bar */}
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-0.5 w-3 rounded-full transition-all duration-500 ${
                  i < Math.min(count, 5) ? 'bg-gold' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-white/80 leading-relaxed">{interp.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LinesAnalysis({ result, locale, unlocked }: LinesAnalysisProps) {
  const labels = SECTION_LABELS[locale];

  const rows = LINES.slice(0, 3);
  const cols = LINES.slice(3, 6);
  const diags = LINES.slice(6, 8);

  const content = (
    <div className="space-y-4">
      {/* Rows */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-gold/70 uppercase tracking-widest px-1">{labels.rows}</span>
        {rows.map((line, idx) => (
          <LineCard key={line.key} line={line} result={result} locale={locale} idx={idx} />
        ))}
      </div>

      {/* Columns */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-gold/70 uppercase tracking-widest px-1">{labels.cols}</span>
        {cols.map((line, idx) => (
          <LineCard key={line.key} line={line} result={result} locale={locale} idx={idx + 3} />
        ))}
      </div>

      {/* Diagonals */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-gold/70 uppercase tracking-widest px-1">{labels.diags}</span>
        {diags.map((line, idx) => (
          <LineCard key={line.key} line={line} result={result} locale={locale} idx={idx + 6} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-white/70 uppercase tracking-wider px-1">
        {locale === 'de' ? 'Linien-Analyse' : 'Анализ линий'}
      </h3>

      {unlocked ? (
        <BlurReveal isRevealed={true} shimmer={true}>
          {content}
        </BlurReveal>
      ) : (
        <div className="relative">
          <BlurReveal isRevealed={false}>
            {content}
          </BlurReveal>
          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-gold/20 bg-body/90 px-6 py-4 backdrop-blur-sm text-center shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="text-xs text-white/70 max-w-[220px]">
                {locale === 'de'
                  ? 'E-Mail eingeben, um die Linien-Analyse freizuschalten'
                  : 'Введите email, чтобы открыть анализ линий'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
