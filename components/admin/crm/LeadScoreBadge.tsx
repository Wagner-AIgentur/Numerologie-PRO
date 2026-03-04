'use client';

interface Props {
  score: number;
}

/**
 * Circular lead-score badge with color coding:
 *  0-30  = red    (cold)
 *  31-60 = yellow (warm)
 *  61-100 = green (hot)
 */
export default function LeadScoreBadge({ score }: Props) {
  const clamped = Math.max(0, Math.min(100, score));

  // Color tiers
  let bgColor: string;
  let textColor: string;
  let ringColor: string;

  if (clamped <= 30) {
    bgColor = 'bg-red-500/20';
    textColor = 'text-red-400';
    ringColor = 'ring-red-500/40';
  } else if (clamped <= 60) {
    bgColor = 'bg-yellow-500/20';
    textColor = 'text-yellow-400';
    ringColor = 'ring-yellow-500/40';
  } else {
    bgColor = 'bg-emerald-500/20';
    textColor = 'text-emerald-400';
    ringColor = 'ring-emerald-500/40';
  }

  return (
    <div
      className={`
        inline-flex items-center justify-center
        w-10 h-10 rounded-full
        ring-2 ${ringColor}
        ${bgColor}
        ${textColor}
        text-xs font-bold
        tabular-nums
      `}
      title={`Lead Score: ${clamped}/100`}
    >
      {clamped}
    </div>
  );
}
