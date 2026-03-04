'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface BirthdayInputProps {
  onCalculate: (day: number, month: number, year: number) => void;
  isLoading?: boolean;
  initialValue?: string;
}

// Auto-format input as DD.MM.YYYY while typing
function formatDateInput(raw: string): string {
  // Remove everything except digits and dots
  const digits = raw.replace(/[^\d]/g, '');

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
}

export default function BirthdayInput({ onCalculate, isLoading, initialValue = '' }: BirthdayInputProps) {
  const t = useTranslations('calculator');
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    // Limit to full date length DD.MM.YYYY = 10 chars
    if (formatted.length <= 10) {
      setValue(formatted);
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Expect DD.MM.YYYY
    const parts = value.split('.');
    if (parts.length !== 3) {
      setError('Format: TT.MM.JJJJ (z. B. 15.03.1990)');
      return;
    }

    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);

    if (!d || d < 1 || d > 31) {
      setError('Ungültiger Tag (1-31)');
      return;
    }
    if (!m || m < 1 || m > 12) {
      setError('Ungültiger Monat (1-12)');
      return;
    }
    if (!y || y < 1900 || y > 2030) {
      setError('Ungültiges Jahr (1900-2030)');
      return;
    }

    onCalculate(d, m, y);
  };

  const isComplete = value.length === 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <p className="text-xs text-white/60">TT.MM.JJJJ</p>
      </div>

      {/* Single date input field */}
      <div className="relative">
        <motion.div
          animate={isFocused ? { boxShadow: '0 0 0 2px rgba(212,175,55,0.4), 0 0 15px rgba(212,175,55,0.08)' } : { boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl overflow-hidden"
        >
          <input
            type="text"
            inputMode="numeric"
            placeholder="TT.MM.JJJJ"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={10}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center text-3xl font-bold text-white placeholder-white/20 focus:outline-none tracking-[0.15em] transition-colors"
            style={{ caretColor: '#D4AF37', letterSpacing: '0.15em' }}
          />
        </motion.div>

        {/* Progress indicator dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {[0,1,2,3,4,5,6,7,8,9].map((i) => {
            // Skip dot positions (index 2 and 5)
            if (i === 2 || i === 5) return null;
            const charIdx = i <= 2 ? i : i <= 5 ? i - 1 : i - 2;
            const filled = value.replace(/\./g, '').length > charIdx;
            return (
              <div
                key={i}
                className={`h-1 w-1 rounded-full transition-all duration-200 ${filled ? 'bg-gold scale-125' : 'bg-white/10'}`}
              />
            );
          })}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 text-center"
        >
          {error}
        </motion.p>
      )}

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={isLoading || !isComplete}
        whileHover={isComplete && !isLoading ? { scale: 1.02 } : {}}
        whileTap={isComplete && !isLoading ? { scale: 0.98 } : {}}
        className={`w-full rounded-pill px-6 py-4 text-base font-bold uppercase tracking-widest transition-all duration-300 ${
          isComplete && !isLoading
            ? 'bg-gold-gradient text-teal-dark shadow-gold hover:shadow-gold-hover cursor-pointer btn-pulse-glow'
            : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-dark border-t-transparent" />
            Berechne...
          </span>
        ) : (
          t('calculate')
        )}
      </motion.button>
    </form>
  );
}
