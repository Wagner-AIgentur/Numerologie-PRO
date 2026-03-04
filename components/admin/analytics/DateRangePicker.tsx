'use client';

import { cn } from '@/lib/utils';

const ranges = [
  { key: 'today', label: 'Heute' },
  { key: '7d', label: '7 Tage' },
  { key: '30d', label: '30 Tage' },
  { key: '12m', label: '12 Monate' },
  { key: 'all', label: 'Gesamt' },
] as const;

export type DateRange = (typeof ranges)[number]['key'];

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  loading?: boolean;
}

export default function DateRangePicker({ value, onChange, loading }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          disabled={loading}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
            value === key
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'text-white/50 border border-white/10 hover:text-white hover:border-white/20',
            loading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
